"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import { paymentMethodLabels } from "@/lib/constants"

export interface PurchaseRow {
  id: number
  supplierName: string
  date: Date
  invoiceNumber: string | null
  totalAmount: number
  paymentMethod: keyof typeof paymentMethodLabels
  itemSummary: string
}

export const purchaseColumns: ColumnDef<PurchaseRow>[] = [
  {
    accessorKey: "supplierName",
    header: "Supplier",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.supplierName}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.invoiceNumber || "No invoice #"}
        </p>
      </div>
    ),
  },
  { accessorKey: "itemSummary", header: "Items" },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => <Badge variant="outline">{paymentMethodLabels[row.original.paymentMethod]}</Badge>,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.totalAmount)}</span>
    ),
  },
]
