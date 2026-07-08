"use client"

import { useMemo, useState } from "react"
import { Plus, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildSupplierColumns, type SupplierRow } from "./columns"
import { SupplierForm } from "./supplier-form"
import { deleteSupplier } from "@/features/suppliers/actions"

export function SuppliersTable({ data }: { data: SupplierRow[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SupplierRow | null>(null)

  const columns = useMemo(
    () =>
      buildSupplierColumns({
        onEdit: (row) => {
          setEditing(row)
          setFormOpen(true)
        },
        onDelete: (row) => setDeleteTarget(row),
      }),
    []
  )

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteSupplier(deleteTarget.id)
      toast.success("Supplier deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete supplier")
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
          <Plus className="size-4" /> Add Supplier
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No suppliers yet"
          description="Add suppliers to track purchases and inventory sources."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search suppliers..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>
          <SupplierForm supplier={editing} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete supplier?"
        description={`This will permanently delete ${deleteTarget?.name}. This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
