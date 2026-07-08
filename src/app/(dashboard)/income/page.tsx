import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { IncomeTable } from "@/features/income/components/income-table"
import type { IncomeRow } from "@/features/income/components/columns"

export default async function IncomePage() {
  const [payments, ordersWithBalance] = await Promise.all([
    prisma.customerPayment.findMany({
      orderBy: { date: "desc" },
      include: { order: true, customer: true },
    }),
    prisma.order.findMany({
      where: { remainingBalance: { gt: 0 } },
      orderBy: { orderDate: "desc" },
      include: { customer: true },
    }),
  ])

  const rows: IncomeRow[] = payments.map((p) => ({
    id: p.id,
    orderNumber: p.order.orderNumber,
    customerName: p.customer.name,
    amount: Number(p.amount),
    paymentMethod: p.paymentMethod,
    date: p.date,
    invoiceNumber: p.invoiceNumber,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description="Customer payments received against orders"
      />
      <IncomeTable
        data={rows}
        orders={ordersWithBalance.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customer.name,
          remainingBalance: Number(o.remainingBalance),
        }))}
      />
    </div>
  )
}
