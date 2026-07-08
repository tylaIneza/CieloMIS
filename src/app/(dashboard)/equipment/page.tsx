import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { EquipmentTable } from "@/features/equipment/components/equipment-table"
import type { EquipmentRow } from "@/features/equipment/components/columns"

export default async function EquipmentPage() {
  const [equipment, suppliers] = await Promise.all([
    prisma.equipment.findMany({
      orderBy: { name: "asc" },
      include: {
        supplier: true,
        maintenanceRecords: { orderBy: { date: "desc" } },
      },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ])

  const rows: EquipmentRow[] = equipment.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    brand: e.brand,
    model: e.model,
    serialNumber: e.serialNumber,
    purchaseDate: e.purchaseDate,
    purchasePrice: Number(e.purchasePrice ?? 0),
    warrantyExpiry: e.warrantyExpiry,
    supplierId: e.supplierId,
    supplierName: e.supplier?.name ?? null,
    condition: e.condition,
    maintenanceRecords: e.maintenanceRecords.map((m) => ({
      id: m.id,
      date: m.date,
      description: m.description,
      cost: Number(m.cost ?? 0),
      performedBy: m.performedBy,
      nextMaintenanceDate: m.nextMaintenanceDate,
      notes: m.notes,
    })),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment"
        description="Machines, tools, and furniture with maintenance history"
      />
      <EquipmentTable data={rows} suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  )
}
