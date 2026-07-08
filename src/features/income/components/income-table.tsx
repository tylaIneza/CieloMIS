"use client"

import { useState } from "react"
import { Plus, BadgeDollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { incomeColumns, type IncomeRow } from "./columns"
import { IncomeForm } from "./income-form"

interface OrderOption {
  id: number
  orderNumber: string
  customerName: string
  remainingBalance: number
}

export function IncomeTable({
  data,
  orders,
}: {
  data: IncomeRow[]
  orders: OrderOption[]
}) {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)} disabled={orders.length === 0}>
          <Plus className="size-4" /> Record Payment
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={BadgeDollarSign}
          title="No payments recorded"
          description="Payments against orders will appear here."
        />
      ) : (
        <DataTable columns={incomeColumns} data={data} searchPlaceholder="Search payments..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <IncomeForm orders={orders} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
