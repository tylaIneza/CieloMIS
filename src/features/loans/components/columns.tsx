"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, TrendingUp, HandCoins, History, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/format"

export interface LoanPaymentEntry {
  id: number
  amount: number
  source: "PAYROLL_DEDUCTION" | "MANUAL"
  date: Date
  notes: string | null
}

export interface LoanRow {
  id: number
  employeeName: string
  amount: number
  balance: number
  status: "ACTIVE" | "PAID"
  issuedDate: Date
  notes: string | null
  payments: LoanPaymentEntry[]
}

export function buildLoanColumns({
  onIncrease,
  onRepay,
  onHistory,
  onDelete,
}: {
  onIncrease: (row: LoanRow) => void
  onRepay: (row: LoanRow) => void
  onHistory: (row: LoanRow) => void
  onDelete: (row: LoanRow) => void
}): ColumnDef<LoanRow>[] {
  return [
    { accessorKey: "employeeName", header: "Employee" },
    {
      accessorKey: "amount",
      header: "Original amount",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <span className={row.original.balance > 0 ? "font-medium" : "text-muted-foreground"}>
          {formatCurrency(row.original.balance)}
        </span>
      ),
    },
    {
      accessorKey: "issuedDate",
      header: "Issued",
      cell: ({ row }) => formatDate(row.original.issuedDate),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "outline" : "default"}>
          {row.original.status === "ACTIVE" ? "Active" : "Paid off"}
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
              disabled={row.original.status === "PAID"}
              onClick={() => onIncrease(row.original)}
            >
              <TrendingUp className="size-4" /> Increase loan
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={row.original.status === "PAID"}
              onClick={() => onRepay(row.original)}
            >
              <HandCoins className="size-4" /> Record repayment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onHistory(row.original)}>
              <History className="size-4" /> View statement
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={row.original.payments.length > 0}
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
