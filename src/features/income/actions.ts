"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { auth } from "@/lib/auth"
import { incomeSchema, type IncomeFormValues } from "./schema"

export async function createIncome(values: IncomeFormValues) {
  const data = incomeSchema.parse(values)
  const order = await prisma.order.findUniqueOrThrow({ where: { id: data.orderId } })
  const remainingBalance = Number(order.remainingBalance)

  if (data.amount > remainingBalance) {
    return {
      error: `Payment can't exceed the remaining balance of RWF ${remainingBalance.toLocaleString()}.`,
    }
  }

  const session = await auth()
  const recordedById = session?.user?.id ? Number(session.user.id) : null

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.customerPayment.create({
      data: {
        orderId: data.orderId,
        customerId: order.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        date: new Date(data.date),
        invoiceNumber: data.invoiceNumber || null,
        notes: data.notes || null,
        recordedById,
      },
    })

    await tx.order.update({
      where: { id: data.orderId },
      data: {
        deposit: { increment: data.amount },
        remainingBalance: { decrement: data.amount },
      },
    })

    return created
  })

  await logActivity({
    action: "CREATE",
    entityType: "CustomerPayment",
    entityId: payment.id,
    newValue: data,
  })
  revalidatePath("/income")
  revalidatePath("/orders")
  revalidatePath("/dashboard")
  return { id: payment.id }
}
