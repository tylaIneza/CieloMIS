"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { productSchema, type ProductFormValues } from "./schema"

export async function createProduct(values: ProductFormValues) {
  const data = productSchema.parse(values)
  const product = await prisma.product.create({ data })
  await logActivity({
    action: "CREATE",
    entityType: "Product",
    entityId: product.id,
    newValue: data,
  })
  revalidatePath("/products")
  return { id: product.id }
}

export async function updateProduct(id: number, values: ProductFormValues) {
  const data = productSchema.parse(values)
  const product = await prisma.product.update({ where: { id }, data })
  await logActivity({
    action: "UPDATE",
    entityType: "Product",
    entityId: id,
    newValue: data,
  })
  revalidatePath("/products")
  return { id: product.id }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({ where: { id } })
  } catch {
    throw new Error(
      "This product is used by existing orders or production records and can't be deleted. Mark it inactive instead."
    )
  }
  await logActivity({ action: "DELETE", entityType: "Product", entityId: id })
  revalidatePath("/products")
}
