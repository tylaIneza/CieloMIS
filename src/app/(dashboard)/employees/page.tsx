import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { EmployeesTable } from "@/features/employees/components/employees-table"
import type { EmployeeRow } from "@/features/employees/components/columns"

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
    include: {
      loans: { where: { status: "ACTIVE" } },
    },
  })

  const rows: EmployeeRow[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    phone: e.phone,
    address: e.address,
    position: e.position,
    hireDate: e.hireDate,
    status: e.status,
    photoUrl: e.photoUrl,
    notes: e.notes,
    activeLoanBalance: e.loans.reduce((sum, loan) => sum + Number(loan.balance), 0),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage tailors, cutters, and other boutique staff"
      />
      <EmployeesTable data={rows} />
    </div>
  )
}
