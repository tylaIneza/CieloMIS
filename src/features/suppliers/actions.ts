"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { supplierSchema, type SupplierFormValues } from "./schema"

function toSupplierData(data: SupplierFormValues) {
  return {
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    address: data.address || null,
    notes: data.notes || null,
  }
}

export async function createSupplier(values: SupplierFormValues) {
  const data = supplierSchema.parse(values)
  const supplier = await prisma.supplier.create({ data: toSupplierData(data) })
  await logActivity({
    action: "CREATE",
    entityType: "Supplier",
    entityId: supplier.id,
    newValue: data,
  })
  revalidatePath("/suppliers")
  return supplier
}

export async function updateSupplier(id: number, values: SupplierFormValues) {
  const data = supplierSchema.parse(values)
  const supplier = await prisma.supplier.update({
    where: { id },
    data: toSupplierData(data),
  })
  await logActivity({
    action: "UPDATE",
    entityType: "Supplier",
    entityId: id,
    newValue: data,
  })
  revalidatePath("/suppliers")
  return supplier
}

export async function deleteSupplier(id: number) {
  try {
    await prisma.supplier.delete({ where: { id } })
  } catch {
    return {
      error: "This supplier has linked purchases, inventory items, or equipment and can't be deleted.",
    }
  }
  await logActivity({ action: "DELETE", entityType: "Supplier", entityId: id })
  revalidatePath("/suppliers")
}
