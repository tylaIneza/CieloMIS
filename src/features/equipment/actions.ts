"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import {
  equipmentSchema,
  maintenanceSchema,
  type EquipmentFormValues,
  type MaintenanceFormValues,
} from "./schema"

function toEquipmentData(data: EquipmentFormValues) {
  return {
    name: data.name,
    category: data.category,
    brand: data.brand || null,
    model: data.model || null,
    serialNumber: data.serialNumber || null,
    purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
    purchasePrice: data.purchasePrice,
    warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
    supplierId: data.supplierId || null,
    condition: data.condition,
  }
}

export async function createEquipment(values: EquipmentFormValues) {
  const data = equipmentSchema.parse(values)
  const equipment = await prisma.equipment.create({ data: toEquipmentData(data) })
  await logActivity({
    action: "CREATE",
    entityType: "Equipment",
    entityId: equipment.id,
    newValue: data,
  })
  revalidatePath("/equipment")
  return { id: equipment.id }
}

export async function updateEquipment(id: number, values: EquipmentFormValues) {
  const data = equipmentSchema.parse(values)
  const equipment = await prisma.equipment.update({ where: { id }, data: toEquipmentData(data) })
  await logActivity({
    action: "UPDATE",
    entityType: "Equipment",
    entityId: id,
    newValue: data,
  })
  revalidatePath("/equipment")
  return { id: equipment.id }
}

export async function deleteEquipment(id: number) {
  try {
    await prisma.equipment.delete({ where: { id } })
  } catch {
    throw new Error("This equipment has maintenance history and can't be deleted.")
  }
  await logActivity({ action: "DELETE", entityType: "Equipment", entityId: id })
  revalidatePath("/equipment")
}

export async function addMaintenance(equipmentId: number, values: MaintenanceFormValues) {
  const data = maintenanceSchema.parse(values)
  const record = await prisma.equipmentMaintenance.create({
    data: {
      equipmentId,
      date: new Date(data.date),
      description: data.description,
      cost: data.cost,
      performedBy: data.performedBy || null,
      nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : null,
      notes: data.notes || null,
    },
  })
  await logActivity({
    action: "MAINTENANCE",
    entityType: "Equipment",
    entityId: equipmentId,
    newValue: data,
  })
  revalidatePath("/equipment")
  return { id: record.id }
}
