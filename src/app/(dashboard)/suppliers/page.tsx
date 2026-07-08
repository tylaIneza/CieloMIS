import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { SuppliersTable } from "@/features/suppliers/components/suppliers-table"
import type { SupplierRow } from "@/features/suppliers/components/columns"

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { purchases: true } } },
  })

  const rows: SupplierRow[] = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email,
    address: s.address,
    notes: s.notes,
    purchaseCount: s._count.purchases,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Vendors for fabric, notions, equipment, and more"
      />
      <SuppliersTable data={rows} />
    </div>
  )
}
