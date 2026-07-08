"use client"

import { useMemo, useState } from "react"
import { Plus, Receipt } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildExpenseColumns, type ExpenseRow } from "./columns"
import { ExpenseForm } from "./expense-form"
import { deleteExpense } from "@/features/expenses/actions"

interface Option {
  id: number
  name: string
}

export function ExpensesTable({
  data,
  categories,
  suppliers,
}: {
  data: ExpenseRow[]
  categories: Option[]
  suppliers: Option[]
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null)

  const columns = useMemo(
    () =>
      buildExpenseColumns({
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
      await deleteExpense(deleteTarget.id)
      toast.success("Expense deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete expense")
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
          <Plus className="size-4" /> Record Expense
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses recorded"
          description="Track boutique running costs by category."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search expenses..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Expense" : "Record Expense"}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editing}
            categories={categories}
            suppliers={suppliers}
            onSuccess={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete expense?"
        description={`This will permanently delete this expense entry for ${deleteTarget?.item}.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
