"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/format"

export interface PayrollRow {
  id: number
  employeeName: string
  weekEnding: Date
  grossSalary: number
  loanDeduction: number
  netSalary: number
  status: "PENDING" | "PAID"
  paymentDate: Date | null
}

export function buildPayrollColumns({
  onMarkPaid,
}: {
  onMarkPaid: (row: PayrollRow) => void
}): ColumnDef<PayrollRow>[] {
  return [
    { accessorKey: "employeeName", header: "Employee" },
    {
      accessorKey: "weekEnding",
      header: "Week ending",
      cell: ({ row }) => formatDate(row.original.weekEnding),
    },
    {
      accessorKey: "grossSalary",
      header: "Gross",
      cell: ({ row }) => formatCurrency(row.original.grossSalary),
    },
    {
      accessorKey: "loanDeduction",
      header: "Loan deduction",
      cell: ({ row }) =>
        row.original.loanDeduction > 0 ? (
          <span className="text-amber-600 dark:text-amber-400">
            -{formatCurrency(row.original.loanDeduction)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "netSalary",
      header: "Net salary",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.netSalary)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "PAID" ? "default" : "outline"}>
          {row.original.status === "PAID" ? "Paid" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "PENDING" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Row actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onMarkPaid(row.original)}>
                <CheckCircle2 className="size-4" /> Mark as paid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    },
  ]
}
