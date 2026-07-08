import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { PurchasesTable } from "@/features/purchases/components/purchases-table"
import type { PurchaseRow } from "@/features/purchases/components/columns"

export default async function PurchasesPage() {
  const [purchases, suppliers, inventoryItems] = await Promise.all([
    prisma.purchase.findMany({
      orderBy: { date: "desc" },
      include: { supplier: true, items: { include: { inventoryItem: true } } },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }),
  ])

  const rows: PurchaseRow[] = purchases.map((p) => ({
    id: p.id,
    supplierName: p.supplier.name,
    date: p.date,
    invoiceNumber: p.invoiceNumber,
    totalAmount: Number(p.totalAmount),
    paymentMethod: p.paymentMethod,
    itemSummary: p.items.map((i) => `${i.inventoryItem.name} x${Number(i.quantity)}`).join(", "),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Supplier purchases that automatically restock inventory"
      />
      <PurchasesTable
        data={rows}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        inventoryItems={inventoryItems.map((i) => ({
          id: i.id,
          name: i.name,
          purchasePrice: Number(i.purchasePrice),
          unit: i.unit,
        }))}
      />
    </div>
  )
}
