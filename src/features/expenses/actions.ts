"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { auth } from "@/lib/auth"
import { expenseSchema, type ExpenseFormValues } from "./schema"

async function toExpenseData(data: ExpenseFormValues) {
  const session = await auth()
  return {
    date: new Date(data.date),
    categoryId: data.categoryId,
    item: data.item,
    description: data.description || null,
    supplierId: data.supplierId || null,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalCost: data.quantity * data.unitPrice,
    paymentMethod: data.paymentMethod,
    receiptNumber: data.receiptNumber || null,
    attachmentUrl: data.attachmentUrl || null,
    recordedById: session?.user?.id ? Number(session.user.id) : null,
  }
}

export async function createExpense(values: ExpenseFormValues) {
  const data = expenseSchema.parse(values)
  const expense = await prisma.expense.create({ data: await toExpenseData(data) })
  await logActivity({
    action: "CREATE",
    entityType: "Expense",
    entityId: expense.id,
    newValue: data,
  })
  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { id: expense.id }
}

export async function updateExpense(id: number, values: ExpenseFormValues) {
  const data = expenseSchema.parse(values)
  const expense = await prisma.expense.update({ where: { id }, data: await toExpenseData(data) })
  await logActivity({
    action: "UPDATE",
    entityType: "Expense",
    entityId: id,
    newValue: data,
  })
  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { id: expense.id }
}

export async function deleteExpense(id: number) {
  await prisma.expense.delete({ where: { id } })
  await logActivity({ action: "DELETE", entityType: "Expense", entityId: id })
  revalidatePath("/expenses")
  revalidatePath("/dashboard")
}
