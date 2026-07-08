import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { PayrollTable } from "@/features/payroll/components/payroll-table"
import type { PayrollRow } from "@/features/payroll/components/columns"

export default async function PayrollPage() {
  const payrolls = await prisma.payroll.findMany({
    orderBy: [{ weekEnding: "desc" }, { id: "desc" }],
    include: { employee: true },
  })

  const rows: PayrollRow[] = payrolls.map((p) => ({
    id: p.id,
    employeeName: p.employee.name,
    weekEnding: p.weekEnding,
    grossSalary: Number(p.grossSalary),
    loanDeduction: Number(p.loanDeduction),
    netSalary: Number(p.netSalary),
    status: p.status,
    paymentDate: p.paymentDate,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Weekly payroll runs with automatic loan deductions"
      />
      <PayrollTable data={rows} />
    </div>
  )
}
