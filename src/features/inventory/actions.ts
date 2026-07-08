"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { checkLowStock } from "@/lib/low-stock"
import {
  inventoryItemSchema,
  stockAdjustmentSchema,
  type InventoryItemFormValues,
  type StockAdjustmentValues,
} from "./schema"

function toInventoryData(data: InventoryItemFormValues) {
  return {
    name: data.name,
    category: data.category,
    unit: data.unit,
    purchasePrice: data.purchasePrice,
    supplierId: data.supplierId || null,
    minimumStock: data.minimumStock,
    currentStock: data.currentStock,
    location: data.location || null,
  }
}

export async function createInventoryItem(values: InventoryItemFormValues) {
  const data = inventoryItemSchema.parse(values)
  const item = await prisma.inventoryItem.create({ data: toInventoryData(data) })
  await logActivity({
    action: "CREATE",
    entityType: "InventoryItem",
    entityId: item.id,
    newValue: data,
  })
  await checkLowStock(item.id)
  revalidatePath("/inventory")
  return { id: item.id }
}

export async function updateInventoryItem(id: number, values: InventoryItemFormValues) {
  const data = inventoryItemSchema.parse(values)
  const item = await prisma.inventoryItem.update({ where: { id }, data: toInventoryData(data) })
  await logActivity({
    action: "UPDATE",
    entityType: "InventoryItem",
    entityId: id,
    newValue: data,
  })
  await checkLowStock(item.id)
  revalidatePath("/inventory")
  return { id: item.id }
}

export async function deleteInventoryItem(id: number) {
  try {
    await prisma.inventoryItem.delete({ where: { id } })
  } catch {
    throw new Error(
      "This item has purchase or stock movement history and can't be deleted."
    )
  }
  await logActivity({ action: "DELETE", entityType: "InventoryItem", entityId: id })
  revalidatePath("/inventory")
}

export async function adjustStock(id: number, values: StockAdjustmentValues) {
  const data = stockAdjustmentSchema.parse(values)
  const item = await prisma.inventoryItem.findUniqueOrThrow({ where: { id } })
  const delta = data.newQuantity - Number(item.currentStock)

  await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id },
      data: { currentStock: data.newQuantity },
    })
    if (delta !== 0) {
      await tx.stockMovement.create({
        data: {
          inventoryItemId: id,
          type: "ADJUSTMENT",
          quantity: delta,
          reason: data.reason,
        },
      })
    }
  })

  await logActivity({
    action: "ADJUST_STOCK",
    entityType: "InventoryItem",
    entityId: id,
    newValue: data,
  })
  await checkLowStock(id)
  revalidatePath("/inventory")
}
