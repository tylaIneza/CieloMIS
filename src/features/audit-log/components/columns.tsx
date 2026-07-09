"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"

export interface AuditLogRow {
  id: number
  action: string
  entityType: string
  entityId: number | null
  userName: string | null
  previousValue: unknown
  newValue: unknown
  timestamp: Date
}

const actionLabels: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  UPDATE_STATUS: "Changed status of",
  GENERATE: "Generated",
  MARK_PAID: "Marked paid",
  INCREASE: "Increased",
  REPAYMENT: "Recorded repayment on",
  ADJUST_STOCK: "Adjusted stock for",
  MAINTENANCE: "Logged maintenance for",
  SEED: "Seeded",
}

const actionVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  UPDATE_STATUS: "secondary",
  GENERATE: "outline",
  MARK_PAID: "default",
  INCREASE: "outline",
  REPAYMENT: "default",
  ADJUST_STOCK: "outline",
  MAINTENANCE: "outline",
  SEED: "secondary",
}

const entityRoutes: Record<string, string> = {
  Customer: "/customers",
  CustomerPayment: "/income",
  Employee: "/employees",
  Equipment: "/equipment",
  Expense: "/expenses",
  InventoryItem: "/inventory",
  Loan: "/loans",
  Order: "/orders",
  Payroll: "/payroll",
  Product: "/products",
  Production: "/production",
  Purchase: "/purchases",
  Supplier: "/suppliers",
}

export function buildAuditLogColumns({
  onViewDetails,
}: {
  onViewDetails: (row: AuditLogRow) => void
}): ColumnDef<AuditLogRow>[] {
  return [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDateTime(row.original.timestamp)}</span>
      ),
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => row.original.userName ?? "System",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge variant={actionVariants[row.original.action] ?? "outline"}>
          {actionLabels[row.original.action] ?? row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Entity",
      cell: ({ row }) => {
        const { entityType, entityId } = row.original
        const href = entityRoutes[entityType]
        const label = entityId ? `${entityType} #${entityId}` : entityType
        return href ? (
          <Link href={href} className="font-medium text-primary hover:underline">
            {label}
          </Link>
        ) : (
          label
        )
      },
    },
    {
      id: "details",
      header: "",
      cell: ({ row }) => {
        const hasDetails = row.original.previousValue || row.original.newValue
        return hasDetails ? (
          <Button variant="ghost" size="icon" aria-label="View details" onClick={() => onViewDetails(row.original)}>
            <Eye className="size-4" />
          </Button>
        ) : null
      },
    },
  ]
}
