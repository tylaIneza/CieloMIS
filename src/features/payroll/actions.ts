"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { generatePayrollSchema, type GeneratePayrollValues } from "./schema"

function weekStartFromEnding(weekEnding: Date) {
  const start = new Date(weekEnding)
  start.setUTCDate(start.getUTCDate() - 4) // Friday minus 4 days = Monday
  start.setUTCHours(0, 0, 0, 0)
  return start
}

export async function generatePayroll(values: GeneratePayrollValues) {
  const data = generatePayrollSchema.parse(values)
  const weekEnding = new Date(data.weekEnding)
  weekEnding.setUTCHours(0, 0, 0, 0)
  const weekStart = weekStartFromEnding(weekEnding)
  const weekEndInclusive = new Date(weekEnding)
  weekEndInclusive.setUTCHours(23, 59, 59, 999)

  const settings = await prisma.settings.findUnique({ where: { id: 1 } })
  const deductionPercent = settings ? Number(settings.payrollDeductionPercent) : 30

  const employees = await prisma.employee.findMany({ where: { status: "ACTIVE" } })

  let processed = 0
  let skipped = 0

  for (const employee of employees) {
    const existing = await prisma.payroll.findUnique({
      where: { employeeId_weekEnding: { employeeId: employee.id, weekEnding } },
    })
    if (existing) {
      skipped++
      continue
    }

    const productions = await prisma.production.findMany({
      where: {
        employeeId: employee.id,
        payrollId: null,
        date: { gte: weekStart, lte: weekEndInclusive },
      },
    })

    if (productions.length === 0) {
      skipped++
      continue
    }

    const gross = productions.reduce((sum, p) => sum + Number(p.totalEarned), 0)
    const loan = await prisma.loan.findFirst({
      where: { employeeId: employee.id, status: "ACTIVE" },
    })
    const rawDeduction = Math.round(gross * (deductionPercent / 100))
    const deduction = loan ? Math.min(rawDeduction, Number(loan.balance)) : 0
    const remainingLoan = loan ? Number(loan.balance) - deduction : 0
    const net = gross - deduction

    await prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.create({
        data: {
          employeeId: employee.id,
          weekEnding,
          grossSalary: gross,
          loanDeduction: deduction,
          remainingLoan,
          netSalary: net,
          status: "PENDING",
        },
      })

      for (const p of productions) {
        await tx.production.update({ where: { id: p.id }, data: { payrollId: payroll.id } })
        await tx.payrollItem.create({
          data: { payrollId: payroll.id, productionId: p.id, amount: p.totalEarned },
        })
      }

      if (loan && deduction > 0) {
        await tx.loanPayment.create({
          data: {
            loanId: loan.id,
            amount: deduction,
            source: "PAYROLL_DEDUCTION",
            date: weekEnding,
          },
        })
        await tx.loan.update({
          where: { id: loan.id },
          data: {
            balance: remainingLoan,
            status: remainingLoan <= 0 ? "PAID" : "ACTIVE",
          },
        })
        if (remainingLoan <= 0) {
          await tx.notification.create({
            data: {
              type: "LOAN_PAID",
              title: "Loan fully repaid",
              message: `${employee.name}'s loan has been fully repaid.`,
              relatedEntityType: "Loan",
              relatedEntityId: loan.id,
            },
          })
        }
      }
    })

    processed++
  }

  await logActivity({
    action: "GENERATE",
    entityType: "Payroll",
    newValue: { weekEnding: data.weekEnding, processed, skipped },
  })
  revalidatePath("/payroll")
  revalidatePath("/loans")
  revalidatePath("/employees")
  revalidatePath("/production")
  revalidatePath("/dashboard")
  revalidatePath("/notifications")
  return { processed, skipped }
}

export async function markPayrollPaid(id: number) {
  await prisma.payroll.update({
    where: { id },
    data: { status: "PAID", paymentDate: new Date() },
  })
  await logActivity({ action: "MARK_PAID", entityType: "Payroll", entityId: id })
  revalidatePath("/payroll")
}
