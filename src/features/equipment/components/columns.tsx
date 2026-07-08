"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/format"
import { equipmentCategoryValues, equipmentConditionValues } from "@/features/equipment/schema"

export interface EquipmentMaintenanceEntry {
  id: number
  date: Date
  description: string
  cost: number
  performedBy: string | null
  nextMaintenanceDate: Date | null
  notes: string | null
}

export interface EquipmentRow {
  id: number
  name: string
  category: (typeof equipmentCategoryValues)[number]
  brand: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: Date | null
  purchasePrice: number
  warrantyExpiry: Date | null
  supplierId: number | null
  supplierName: string | null
  condition: (typeof equipmentConditionValues)[number]
  maintenanceRecords: EquipmentMaintenanceEntry[]
}

const categoryLabels: Record<(typeof equipmentCategoryValues)[number], string> = {
  SEWING_MACHINE: "Sewing Machine",
  OVERLOCK_MACHINE: "Overlock Machine",
  EMBROIDERY_MACHINE: "Embroidery Machine",
  STEAM_IRON: "Steam Iron",
  CUTTING_TABLE: "Cutting Table",
  FURNITURE: "Furniture",
  OTHER: "Other",
}

const conditionVariant: Record<
  (typeof equipmentConditionValues)[number],
  "default" | "secondary" | "destructive" | "outline"
> = {
  EXCELLENT: "default",
  GOOD: "secondary",
  FAIR: "outline",
  POOR: "destructive",
  OUT_OF_SERVICE: "destructive",
}

const conditionLabels: Record<(typeof equipmentConditionValues)[number], string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  OUT_OF_SERVICE: "Out of Service",
}

export function buildEquipmentColumns({
  onEdit,
  onMaintenance,
  onDelete,
}: {
  onEdit: (row: EquipmentRow) => void
  onMaintenance: (row: EquipmentRow) => void
  onDelete: (row: EquipmentRow) => void
}): ColumnDef<EquipmentRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Equipment",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">
            {[row.original.brand, row.original.model].filter(Boolean).join(" ") || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <Badge variant="secondary">{categoryLabels[row.original.category]}</Badge>,
    },
    {
      accessorKey: "condition",
      header: "Condition",
      cell: ({ row }) => (
        <Badge variant={conditionVariant[row.original.condition]}>
          {conditionLabels[row.original.condition]}
        </Badge>
      ),
    },
    {
      accessorKey: "purchasePrice",
      header: "Purchase price",
      cell: ({ row }) => formatCurrency(row.original.purchasePrice),
    },
    {
      accessorKey: "supplierName",
      header: "Supplier",
      cell: ({ row }) => row.original.supplierName || <span className="text-muted-foreground">—</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onMaintenance(row.original)}>
              <Wrench className="size-4" /> Maintenance history
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
