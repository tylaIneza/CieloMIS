"use client"

import { useMemo, useState } from "react"
import { Plus, UserSquare2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildCustomerColumns, type CustomerRow } from "./columns"
import { CustomerForm } from "./customer-form"
import { deleteCustomer } from "@/features/customers/actions"

export function CustomersTable({ data }: { data: CustomerRow[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null)

  const columns = useMemo(
    () =>
      buildCustomerColumns({
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
      const result = await deleteCustomer(deleteTarget.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Customer deleted")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete customer")
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
          <Plus className="size-4" /> Add Customer
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={UserSquare2}
          title="No customers yet"
          description="Add your first customer to start creating orders."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search customers..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <CustomerForm customer={editing} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete customer?"
        description={`This will permanently delete ${deleteTarget?.name}. This cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
