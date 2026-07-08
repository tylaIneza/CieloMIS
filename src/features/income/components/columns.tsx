"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import { paymentMethodLabels } from "@/lib/constants"

export interface IncomeRow {
  id: number
  orderNumber: string
  customerName: string
  amount: number
  paymentMethod: keyof typeof paymentMethodLabels
  date: Date
  invoiceNumber: string | null
}

export const incomeColumns: ColumnDef<IncomeRow>[] = [
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
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => <Badge variant="outline">{paymentMethodLabels[row.original.paymentMethod]}</Badge>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium text-emerald-600 dark:text-emerald-400">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
]
