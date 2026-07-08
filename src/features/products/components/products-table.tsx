"use client"

import { useMemo, useState } from "react"
import { Plus, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildProductColumns, type ProductRow } from "./columns"
import { ProductForm } from "./product-form"
import { deleteProduct } from "@/features/products/actions"

export function ProductsTable({ data }: { data: ProductRow[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null)

  const columns = useMemo(
    () =>
      buildProductColumns({
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
      await deleteProduct(deleteTarget.id)
      toast.success("Product deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete product")
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
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No products yet"
          description="Add tailoring products and their payment rates."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search products..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm product={editing} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product?"
        description={`This will permanently delete ${deleteTarget?.name}. This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
