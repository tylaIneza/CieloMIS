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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/format"
import { orderStatusValues } from "@/features/orders/schema"

export interface OrderRow {
  id: number
  orderNumber: string
  customerName: string
  customerId: number
  productSummary: string
  employeeName: string | null
  assignedEmployeeId: number | null
  orderDate: Date
  dueDate: Date
  status: (typeof orderStatusValues)[number]
  totalPrice: number
  deposit: number
  remainingBalance: number
  fabric: string | null
  specialInstructions: string | null
}

const statusLabels: Record<(typeof orderStatusValues)[number], string> = {
  PENDING: "Pending",
  CUTTING: "Cutting",
  SEWING: "Sewing",
  IRONING: "Ironing",
  FINISHED: "Finished",
  DELIVERED: "Delivered",
}

const statusVariant: Record<
  (typeof orderStatusValues)[number],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CUTTING: "secondary",
  SEWING: "secondary",
  IRONING: "secondary",
  FINISHED: "default",
  DELIVERED: "default",
}

export function buildOrderColumns({
  onEdit,
  onDelete,
  onStatusChange,
}: {
  onEdit: (row: OrderRow) => void
  onDelete: (row: OrderRow) => void
  onStatusChange: (row: OrderRow, status: OrderRow["status"]) => void
}): ColumnDef<OrderRow>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{row.original.customerName}</p>
        </div>
      ),
    },
    { accessorKey: "productSummary", header: "Items" },
    {
      accessorKey: "dueDate",
      header: "Due date",
      cell: ({ row }) => {
        const overdue =
          row.original.dueDate < new Date() &&
          row.original.status !== "DELIVERED" &&
          row.original.status !== "FINISHED"
        return (
          <span className={overdue ? "font-medium text-destructive" : ""}>
            {formatDate(row.original.dueDate)}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(v) => onStatusChange(row.original, v as OrderRow["status"])}
        >
          <SelectTrigger size="sm" className="w-[110px]">
            <SelectValue>
              <Badge variant={statusVariant[row.original.status]}>
                {statusLabels[row.original.status]}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {orderStatusValues.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "totalPrice",
      header: "Total",
      cell: ({ row }) => formatCurrency(row.original.totalPrice),
    },
    {
      accessorKey: "remainingBalance",
      header: "Balance",
      cell: ({ row }) =>
        row.original.remainingBalance > 0 ? (
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {formatCurrency(row.original.remainingBalance)}
          </span>
        ) : (
          <span className="text-muted-foreground">Paid</span>
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
