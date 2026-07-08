"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/format"

export interface ProductionRow {
  id: number
  date: Date
  employeeName: string
  productName: string
  quantity: number
  rateSnapshot: number
  totalEarned: number
  isPaid: boolean
}

export function buildProductionColumns({
  onDelete,
}: {
  onDelete: (row: ProductionRow) => void
}): ColumnDef<ProductionRow>[] {
  return [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    { accessorKey: "employeeName", header: "Employee" },
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "quantity", header: "Qty" },
    {
      accessorKey: "totalEarned",
      header: "Total earned",
      cell: ({ row }) => formatCurrency(row.original.totalEarned),
    },
    {
      accessorKey: "isPaid",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isPaid ? "default" : "outline"}>
          {row.original.isPaid ? "Paid" : "Pending"}
        </Badge>
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
            <DropdownMenuItem
              variant="destructive"
              disabled={row.original.isPaid}
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
