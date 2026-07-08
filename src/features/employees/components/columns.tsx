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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency, formatDate } from "@/lib/format"

export interface EmployeeRow {
  id: number
  name: string
  phone: string
  address: string | null
  position: string
  hireDate: Date
  status: "ACTIVE" | "INACTIVE"
  photoUrl: string | null
  notes: string | null
  activeLoanBalance: number
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "E"
  )
}

export function buildEmployeeColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (row: EmployeeRow) => void
  onDelete: (row: EmployeeRow) => void
}): ColumnDef<EmployeeRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={row.original.photoUrl ?? undefined} />
            <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.phone}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "position", header: "Position" },
    {
      accessorKey: "hireDate",
      header: "Hire date",
      cell: ({ row }) => formatDate(row.original.hireDate),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
          {row.original.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "activeLoanBalance",
      header: "Loan balance",
      cell: ({ row }) =>
        row.original.activeLoanBalance > 0 ? (
          <span className="font-medium">
            {formatCurrency(row.original.activeLoanBalance)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
