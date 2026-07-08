import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { ExpensesTable } from "@/features/expenses/components/expenses-table"
import type { ExpenseRow } from "@/features/expenses/components/columns"

export default async function ExpensesPage() {
  const [expenses, categories, suppliers] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: { category: true, supplier: true },
    }),
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ])

  const rows: ExpenseRow[] = expenses.map((e) => ({
    id: e.id,
    date: e.date,
    categoryId: e.categoryId,
    categoryName: e.category.name,
    item: e.item,
    description: e.description,
    supplierId: e.supplierId,
    supplierName: e.supplier?.name ?? null,
    quantity: Number(e.quantity),
    unitPrice: Number(e.unitPrice),
    totalCost: Number(e.totalCost),
    paymentMethod: e.paymentMethod,
    receiptNumber: e.receiptNumber,
    attachmentUrl: e.attachmentUrl,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Rent, utilities, materials, and other running costs"
      />
      <ExpensesTable
        data={rows}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  )
}
