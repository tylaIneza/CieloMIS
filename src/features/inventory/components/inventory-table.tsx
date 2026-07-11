"use client"

import { useMemo, useState } from "react"
import { Plus, Boxes } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildInventoryColumns, type InventoryRow } from "./columns"
import { InventoryForm } from "./inventory-form"
import { AdjustStockForm } from "./adjust-stock-form"
import { deleteInventoryItem } from "@/features/inventory/actions"

interface Option {
  id: number
  name: string
}

export function InventoryTable({
  data,
  suppliers,
}: {
  data: InventoryRow[]
  suppliers: Option[]
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryRow | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<InventoryRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryRow | null>(null)

  const columns = useMemo(
    () =>
      buildInventoryColumns({
        onEdit: (row) => {
          setEditing(row)
          setFormOpen(true)
        },
        onAdjust: (row) => setAdjustTarget(row),
        onDelete: (row) => setDeleteTarget(row),
      }),
    []
  )

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const result = await deleteInventoryItem(deleteTarget.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Item deleted")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete item")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> Add Item
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No inventory items yet"
          description="Track fabric, thread, buttons, and other materials here."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search inventory..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <InventoryForm item={editing} suppliers={suppliers} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!adjustTarget} onOpenChange={(open) => !open && setAdjustTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Stock — {adjustTarget?.name}</DialogTitle>
          </DialogHeader>
          {adjustTarget && (
            <AdjustStockForm
              itemId={adjustTarget.id}
              currentStock={adjustTarget.currentStock}
              unit={adjustTarget.unit}
              onSuccess={() => setAdjustTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete item?"
        description={`This will permanently delete ${deleteTarget?.name}.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
