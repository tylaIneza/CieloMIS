"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/format"

export interface CustomerRow {
  id: number
  name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  orderCount: number
  totalPaid: number
}

export function buildCustomerColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (row: CustomerRow) => void
  onDelete: (row: CustomerRow) => void
}): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || <span className="text-muted-foreground">—</span>,
    },
    { accessorKey: "orderCount", header: "Orders" },
    {
      accessorKey: "totalPaid",
      header: "Total paid",
      cell: ({ row }) => formatCurrency(row.original.totalPaid),
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
            <DropdownMenuItem
              variant="destructive"
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
