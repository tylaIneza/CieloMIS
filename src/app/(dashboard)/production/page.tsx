import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { ProductionTable } from "@/features/production/components/production-table"
import type { ProductionRow } from "@/features/production/components/columns"

export default async function ProductionPage() {
  const [production, employees, products] = await Promise.all([
    prisma.production.findMany({
      orderBy: { date: "desc" },
      take: 200,
      include: { employee: true, product: true },
    }),
    prisma.employee.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  const rows: ProductionRow[] = production.map((p) => ({
    id: p.id,
    date: p.date,
    employeeName: p.employee.name,
    productName: p.product.name,
    quantity: p.quantity,
    rateSnapshot: Number(p.rateSnapshot),
    totalEarned: Number(p.totalEarned),
    isPaid: p.payrollId !== null,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Production"
        description="Log employee output Monday through Friday"
      />
      <ProductionTable
        data={rows}
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          paymentRate: Number(p.paymentRate),
        }))}
      />
    </div>
  )
}
