"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { productionSchema, type ProductionFormValues } from "./schema"

export async function createProduction(values: ProductionFormValues) {
  const data = productionSchema.parse(values)
  const product = await prisma.product.findUniqueOrThrow({ where: { id: data.productId } })
  const rateSnapshot = Number(product.paymentRate)
  const totalEarned = rateSnapshot * data.quantity

  const production = await prisma.production.create({
    data: {
      date: new Date(data.date),
      employeeId: data.employeeId,
      productId: data.productId,
      quantity: data.quantity,
      rateSnapshot,
      totalEarned,
    },
  })

  await logActivity({
    action: "CREATE",
    entityType: "Production",
    entityId: production.id,
    newValue: data,
  })
  revalidatePath("/production")
  revalidatePath("/dashboard")
  revalidatePath("/payroll")
  return { id: production.id }
}

export async function deleteProduction(id: number) {
  const production = await prisma.production.findUniqueOrThrow({ where: { id } })
  if (production.payrollId) {
    return {
      error: "This production entry has already been included in a payroll run and can't be deleted.",
    }
  }
  await prisma.production.delete({ where: { id } })
  await logActivity({ action: "DELETE", entityType: "Production", entityId: id })
  revalidatePath("/production")
  revalidatePath("/dashboard")
}
