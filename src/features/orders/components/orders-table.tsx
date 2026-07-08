"use client"

import { useMemo, useState } from "react"
import { Plus, ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildOrderColumns, type OrderRow } from "./columns"
import { OrderForm } from "./order-form"
import { OrderEditForm } from "./order-edit-form"
import { deleteOrder, updateOrderStatus } from "@/features/orders/actions"

interface Option {
  id: number
  name: string
}
interface ProductOption extends Option {
  paymentRate: number
}

export function OrdersTable({
  data,
  customers,
  employees,
  products,
}: {
  data: OrderRow[]
  customers: Option[]
  employees: Option[]
  products: ProductOption[]
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<OrderRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null)

  const columns = useMemo(
    () =>
      buildOrderColumns({
        onEdit: (row) => setEditing(row),
        onDelete: (row) => setDeleteTarget(row),
        onStatusChange: async (row, status) => {
          try {
            await updateOrderStatus(row.id, status)
            toast.success(`Order ${row.orderNumber} marked ${status.toLowerCase()}`)
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update status")
          }
        },
      }),
    []
  )

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteOrder(deleteTarget.id)
      toast.success("Order deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete order")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> New Order
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Create your first tailoring order to get started."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search orders..." />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
          </DialogHeader>
          <OrderForm
            customers={customers}
            employees={employees}
            products={products}
            onSuccess={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Order {editing?.orderNumber}</DialogTitle>
          </DialogHeader>
          {editing && (
            <OrderEditForm
              order={editing}
              customers={customers}
              employees={employees}
              onSuccess={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete order?"
        description={`This will permanently delete order ${deleteTarget?.orderNumber}. This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
