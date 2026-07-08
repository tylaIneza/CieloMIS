import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { InventoryTable } from "@/features/inventory/components/inventory-table"
import type { InventoryRow } from "@/features/inventory/components/columns"

export default async function InventoryPage() {
  const [items, suppliers] = await Promise.all([
    prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
      include: { supplier: true },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ])

  const rows: InventoryRow[] = items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    unit: i.unit,
    purchasePrice: Number(i.purchasePrice),
    supplierId: i.supplierId,
    supplierName: i.supplier?.name ?? null,
    minimumStock: Number(i.minimumStock),
    currentStock: Number(i.currentStock),
    location: i.location,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Fabric, notions, and materials with low-stock alerts"
      />
      <InventoryTable data={rows} suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  )
}
