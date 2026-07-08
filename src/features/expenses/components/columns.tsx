"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/format"
import { paymentMethodLabels } from "@/lib/constants"

export interface ExpenseRow {
  id: number
  date: Date
  categoryId: number
  categoryName: string
  item: string
  description: string | null
  supplierId: number | null
  supplierName: string | null
  quantity: number
  unitPrice: number
  totalCost: number
  paymentMethod: keyof typeof paymentMethodLabels
  receiptNumber: string | null
  attachmentUrl: string | null
}

export function buildExpenseColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (row: ExpenseRow) => void
  onDelete: (row: ExpenseRow) => void
}): ColumnDef<ExpenseRow>[] {
  return [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "item",
      header: "Item",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.item}</p>
          <p className="text-xs text-muted-foreground">{row.original.supplierName || ""}</p>
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => <Badge variant="secondary">{row.original.categoryName}</Badge>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => paymentMethodLabels[row.original.paymentMethod],
    },
    {
      accessorKey: "totalCost",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.totalCost)}</span>
      ),
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
