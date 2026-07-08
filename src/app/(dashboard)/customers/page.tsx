import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { CustomersTable } from "@/features/customers/components/customers-table"
import type { CustomerRow } from "@/features/customers/components/columns"

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { orders: true } },
      customerPayments: { select: { amount: true } },
    },
  })

  const rows: CustomerRow[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    notes: c.notes,
    orderCount: c._count.orders,
    totalPaid: c.customerPayments.reduce((sum, p) => sum + Number(p.amount), 0),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Customer profiles, order history, and payments"
      />
      <CustomersTable data={rows} />
    </div>
  )
}
