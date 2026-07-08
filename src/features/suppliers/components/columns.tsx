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

export interface SupplierRow {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  purchaseCount: number
}

export function buildSupplierColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (row: SupplierRow) => void
  onDelete: (row: SupplierRow) => void
}): ColumnDef<SupplierRow>[] {
  return [
    { accessorKey: "name", header: "Supplier" },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || <span className="text-muted-foreground">—</span>,
    },
    { accessorKey: "purchaseCount", header: "Purchases" },
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
