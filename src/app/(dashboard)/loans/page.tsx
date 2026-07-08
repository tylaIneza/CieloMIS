import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { LoansTable } from "@/features/loans/components/loans-table"
import type { LoanRow } from "@/features/loans/components/columns"

export default async function LoansPage() {
  const [loans, employees] = await Promise.all([
    prisma.loan.findMany({
      orderBy: { issuedDate: "desc" },
      include: { employee: true, payments: { orderBy: { date: "desc" } } },
    }),
    prisma.employee.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ])

  const rows: LoanRow[] = loans.map((l) => ({
    id: l.id,
    employeeName: l.employee.name,
    amount: Number(l.amount),
    balance: Number(l.balance),
    status: l.status,
    issuedDate: l.issuedDate,
    notes: l.notes,
    payments: l.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      source: p.source,
      date: p.date,
      notes: p.notes,
    })),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loans"
        description="Employee advances, repayments, and outstanding balances"
      />
      <LoansTable data={rows} employees={employees.map((e) => ({ id: e.id, name: e.name }))} />
    </div>
  )
}
