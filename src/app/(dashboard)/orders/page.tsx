import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { OrdersTable } from "@/features/orders/components/orders-table"
import type { OrderRow } from "@/features/orders/components/columns"

export default async function OrdersPage() {
  const [orders, customers, employees, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { orderDate: "desc" },
      include: {
        customer: true,
        assignedEmployee: true,
        items: { include: { product: true } },
      },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer.name,
    customerId: o.customerId,
    productSummary: o.items.map((i) => `${i.product.name} x${i.quantity}`).join(", "),
    employeeName: o.assignedEmployee?.name ?? null,
    assignedEmployeeId: o.assignedEmployeeId,
    orderDate: o.orderDate,
    dueDate: o.dueDate,
    status: o.status,
    totalPrice: Number(o.totalPrice),
    deposit: Number(o.deposit),
    remainingBalance: Number(o.remainingBalance),
    fabric: o.fabric,
    specialInstructions: o.specialInstructions,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track tailoring orders from intake to delivery"
      />
      <OrdersTable
        data={rows}
        customers={customers.map((c) => ({ id: c.id, name: c.name }))}
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
