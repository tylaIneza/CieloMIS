"use client"

import { useState } from "react"
import { Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { purchaseColumns, type PurchaseRow } from "./columns"
import { PurchaseForm } from "./purchase-form"

interface Option {
  id: number
  name: string
}
interface InventoryOption extends Option {
  purchasePrice: number
  unit: string
}

export function PurchasesTable({
  data,
  suppliers,
  inventoryItems,
}: {
  data: PurchaseRow[]
  suppliers: Option[]
  inventoryItems: InventoryOption[]
}) {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" /> Record Purchase
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchases yet"
          description="Record a purchase to automatically update inventory stock."
        />
      ) : (
        <DataTable columns={purchaseColumns} data={data} searchPlaceholder="Search purchases..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Purchase</DialogTitle>
          </DialogHeader>
          <PurchaseForm
            suppliers={suppliers}
            inventoryItems={inventoryItems}
            onSuccess={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
