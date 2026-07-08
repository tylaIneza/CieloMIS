"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, SlidersHorizontal, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/format"
import { inventoryCategoryValues } from "@/features/inventory/schema"

export interface InventoryRow {
  id: number
  name: string
  category: (typeof inventoryCategoryValues)[number]
  unit: string
  purchasePrice: number
  supplierId: number | null
  supplierName: string | null
  minimumStock: number
  currentStock: number
  location: string | null
}

const categoryLabels: Record<(typeof inventoryCategoryValues)[number], string> = {
  FABRIC: "Fabric",
  THREAD: "Thread",
  BUTTONS: "Buttons",
  ZIPPERS: "Zippers",
  ELASTIC: "Elastic",
  NEEDLES: "Needles",
  LABELS: "Labels",
  PACKAGING: "Packaging",
  LINING: "Lining",
  OTHER: "Other",
}

export function buildInventoryColumns({
  onEdit,
  onAdjust,
  onDelete,
}: {
  onEdit: (row: InventoryRow) => void
  onAdjust: (row: InventoryRow) => void
  onDelete: (row: InventoryRow) => void
}): ColumnDef<InventoryRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Item",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.currentStock < row.original.minimumStock && (
            <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          )}
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.location || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="secondary">{categoryLabels[row.original.category]}</Badge>
      ),
    },
    {
      accessorKey: "currentStock",
      header: "Stock",
      cell: ({ row }) => (
        <span
          className={
            row.original.currentStock < row.original.minimumStock
              ? "font-medium text-amber-600 dark:text-amber-400"
              : ""
          }
        >
          {row.original.currentStock} / {row.original.minimumStock} {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: "purchasePrice",
      header: "Unit price",
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
            <DropdownMenuItem onClick={() => onAdjust(row.original)}>
              <SlidersHorizontal className="size-4" /> Adjust stock
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
