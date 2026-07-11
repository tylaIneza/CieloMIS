"use client"

import { useMemo, useState } from "react"
import { Plus, Scissors } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildProductionColumns, type ProductionRow } from "./columns"
import { ProductionForm } from "./production-form"
import { deleteProduction } from "@/features/production/actions"

interface Option {
  id: number
  name: string
}
interface ProductOption extends Option {
  paymentRate: number
}

export function ProductionTable({
  data,
  employees,
  products,
}: {
  data: ProductionRow[]
  employees: Option[]
  products: ProductOption[]
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProductionRow | null>(null)

  const columns = useMemo(
    () => buildProductionColumns({ onDelete: (row) => setDeleteTarget(row) }),
    []
  )

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const result = await deleteProduction(deleteTarget.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Production entry deleted")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete entry")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" /> Record Production
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No production recorded yet"
          description="Log daily output per employee to drive weekly payroll."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search production..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Production</DialogTitle>
          </DialogHeader>
          <ProductionForm
            employees={employees}
            products={products}
            onSuccess={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete production entry?"
        description="This will permanently remove this production record."
        onConfirm={handleDelete}
      />
    </div>
  )
}
