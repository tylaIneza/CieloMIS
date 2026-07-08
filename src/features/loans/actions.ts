"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { loanSchema, loanAdjustmentSchema, type LoanFormValues, type LoanAdjustmentValues } from "./schema"

export async function createLoan(values: LoanFormValues) {
  const data = loanSchema.parse(values)
  const loan = await prisma.loan.create({
    data: {
      employeeId: data.employeeId,
      amount: data.amount,
      balance: data.amount,
      status: "ACTIVE",
      issuedDate: new Date(data.issuedDate),
      notes: data.notes || null,
    },
  })
  await logActivity({
    action: "CREATE",
    entityType: "Loan",
    entityId: loan.id,
    newValue: data,
  })
  revalidatePath("/loans")
  revalidatePath("/employees")
  return { id: loan.id }
}

export async function increaseLoan(loanId: number, values: LoanAdjustmentValues) {
  const data = loanAdjustmentSchema.parse(values)
  const loan = await prisma.loan.findUniqueOrThrow({ where: { id: loanId } })
  const newBalance = Number(loan.balance) + data.amount
  const newAmount = Number(loan.amount) + data.amount

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      amount: newAmount,
      balance: newBalance,
      status: "ACTIVE",
    },
  })

  await logActivity({
    action: "INCREASE",
    entityType: "Loan",
    entityId: loanId,
    newValue: data,
  })
  revalidatePath("/loans")
  revalidatePath("/employees")
}

export async function addRepayment(loanId: number, values: LoanAdjustmentValues) {
  const data = loanAdjustmentSchema.parse(values)
  const loan = await prisma.loan.findUniqueOrThrow({ where: { id: loanId } })
  const currentBalance = Number(loan.balance)

  if (data.amount > currentBalance) {
    throw new Error(
      `Repayment can't exceed the remaining balance of RWF ${currentBalance.toLocaleString()}.`
    )
  }

  const newBalance = currentBalance - data.amount

  await prisma.loanPayment.create({
    data: {
      loanId,
      amount: data.amount,
      source: "MANUAL",
      date: new Date(data.date),
      notes: data.notes || null,
    },
  })

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      balance: newBalance,
      status: newBalance <= 0 ? "PAID" : "ACTIVE",
    },
  })

  if (newBalance <= 0) {
    const employee = await prisma.employee.findUniqueOrThrow({ where: { id: loan.employeeId } })
    await prisma.notification.create({
      data: {
        type: "LOAN_PAID",
        title: "Loan fully repaid",
        message: `${employee.name}'s loan has been fully repaid.`,
        relatedEntityType: "Loan",
        relatedEntityId: loanId,
      },
    })
  }

  await logActivity({
    action: "REPAYMENT",
    entityType: "Loan",
    entityId: loanId,
    newValue: data,
  })
  revalidatePath("/loans")
  revalidatePath("/employees")
  revalidatePath("/notifications")
}

export async function deleteLoan(id: number) {
  const payments = await prisma.loanPayment.count({ where: { loanId: id } })
  if (payments > 0) {
    throw new Error("This loan has repayment history and can't be deleted.")
  }
  await prisma.loan.delete({ where: { id } })
  await logActivity({ action: "DELETE", entityType: "Loan", entityId: id })
  revalidatePath("/loans")
  revalidatePath("/employees")
}
