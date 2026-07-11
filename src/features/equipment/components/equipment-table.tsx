"use client"

import { useMemo, useState } from "react"
import { Plus, Wrench } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { formatCurrency, formatDate } from "@/lib/format"
import { buildEquipmentColumns, type EquipmentRow } from "./columns"
import { EquipmentForm } from "./equipment-form"
import { MaintenanceForm } from "./maintenance-form"
import { deleteEquipment } from "@/features/equipment/actions"

interface Option {
  id: number
  name: string
}

export function EquipmentTable({ data, suppliers }: { data: EquipmentRow[]; suppliers: Option[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EquipmentRow | null>(null)
  const [maintenanceTarget, setMaintenanceTarget] = useState<EquipmentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EquipmentRow | null>(null)

  const columns = useMemo(
    () =>
      buildEquipmentColumns({
        onEdit: (row) => {
          setEditing(row)
          setFormOpen(true)
        },
        onMaintenance: (row) => setMaintenanceTarget(row),
        onDelete: (row) => setDeleteTarget(row),
      }),
    []
  )

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const result = await deleteEquipment(deleteTarget.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Equipment deleted")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete equipment")
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
          <Plus className="size-4" /> Add Equipment
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No equipment recorded"
          description="Track sewing machines, irons, and other boutique equipment."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search equipment..." />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
          </DialogHeader>
          <EquipmentForm equipment={editing} suppliers={suppliers} onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!maintenanceTarget}
        onOpenChange={(open) => !open && setMaintenanceTarget(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Maintenance — {maintenanceTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {maintenanceTarget && (
              <MaintenanceForm
                equipmentId={maintenanceTarget.id}
                onSuccess={() => setMaintenanceTarget(null)}
              />
            )}
            {maintenanceTarget?.maintenanceRecords.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No maintenance history yet.
              </p>
            ) : (
              <div className="divide-y rounded-lg border text-sm">
                {maintenanceTarget?.maintenanceRecords.map((m) => (
                  <div key={m.id} className="space-y-1 p-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{formatDate(m.date)}</span>
                      <span>{formatCurrency(m.cost)}</span>
                    </div>
                    <p className="text-muted-foreground">{m.description}</p>
                    {m.performedBy && (
                      <p className="text-xs text-muted-foreground">By {m.performedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete equipment?"
        description={`This will permanently delete ${deleteTarget?.name}.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
