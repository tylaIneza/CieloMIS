"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { customerSchema, type CustomerFormValues } from "./schema"

function toCustomerData(data: CustomerFormValues) {
  return {
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    address: data.address || null,
    notes: data.notes || null,
  }
}

export async function createCustomer(values: CustomerFormValues) {
  const data = customerSchema.parse(values)
  const customer = await prisma.customer.create({ data: toCustomerData(data) })
  await logActivity({
    action: "CREATE",
    entityType: "Customer",
    entityId: customer.id,
    newValue: data,
  })
  revalidatePath("/customers")
  return customer
}

export async function updateCustomer(id: number, values: CustomerFormValues) {
  const data = customerSchema.parse(values)
  const customer = await prisma.customer.update({
    where: { id },
    data: toCustomerData(data),
  })
  await logActivity({
    action: "UPDATE",
    entityType: "Customer",
    entityId: id,
    newValue: data,
  })
  revalidatePath("/customers")
  return customer
}

export async function deleteCustomer(id: number) {
  try {
    await prisma.customer.delete({ where: { id } })
  } catch {
    return {
      error: "This customer has existing orders or payments and can't be deleted.",
    }
  }
  await logActivity({ action: "DELETE", entityType: "Customer", entityId: id })
  revalidatePath("/customers")
}
