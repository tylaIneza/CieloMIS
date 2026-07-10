"use client"

import { useMemo, useState } from "react"
import { Plus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildEmployeeColumns, type EmployeeRow } from "./columns"
import { EmployeeForm } from "./employee-form"
import { deleteEmployee } from "@/features/employees/actions"
import { EMPLOYEE_LINKED_RECORDS_MESSAGE } from "@/features/employees/constants"

export function EmployeesTable({ data }: { data: EmployeeRow[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EmployeeRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null)
  const [blockedTarget, setBlockedTarget] = useState<EmployeeRow | null>(null)

  const columns = useMemo(
    () =>
      buildEmployeeColumns({
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
      await deleteEmployee(deleteTarget.id)
      toast.success("Employee deleted")
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message === EMPLOYEE_LINKED_RECORDS_MESSAGE) {
        setBlockedTarget(deleteTarget)
      } else {
        toast.error(message || "Could not delete employee")
      }
    }
  }

  async function handleForceDelete() {
    if (!blockedTarget) return
    try {
      await deleteEmployee(blockedTarget.id, { force: true })
      toast.success("Employee deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete employee")
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
          <Plus className="size-4" /> Add Employee
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="Add your first employee to start tracking production and payroll."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search employees..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <EmployeeForm employee={editing} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete employee?"
        description={`This will permanently delete ${deleteTarget?.name}. This cannot be undone.`}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!blockedTarget}
        onOpenChange={(open) => !open && setBlockedTarget(null)}
        title="Can't delete employee"
        description={`${EMPLOYEE_LINKED_RECORDS_MESSAGE} Or delete anyway to permanently remove ${blockedTarget?.name} along with their production, payroll, and loan records (linked orders will be kept but unassigned).`}
        confirmLabel="Delete Anyway"
        onConfirm={handleForceDelete}
      />
    </div>
  )
}
