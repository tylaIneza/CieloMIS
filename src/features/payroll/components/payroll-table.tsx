"use client"

import { useMemo, useState } from "react"
import { Wallet, PlayCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { buildPayrollColumns, type PayrollRow } from "./columns"
import { GeneratePayrollForm } from "./generate-payroll-form"
import { markPayrollPaid } from "@/features/payroll/actions"
import { formatCurrency } from "@/lib/format"

export function PayrollTable({ data }: { data: PayrollRow[] }) {
  const [generateOpen, setGenerateOpen] = useState(false)
  const [markPaidTarget, setMarkPaidTarget] = useState<PayrollRow | null>(null)

  const columns = useMemo(
    () => buildPayrollColumns({ onMarkPaid: (row) => setMarkPaidTarget(row) }),
    []
  )

  async function handleMarkPaid() {
    if (!markPaidTarget) return
    try {
      await markPayrollPaid(markPaidTarget.id)
      toast.success("Payroll marked as paid")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update payroll")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setGenerateOpen(true)}>
          <PlayCircle className="size-4" /> Generate Weekly Payroll
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payroll runs yet"
          description="Generate payroll once employees have recorded production for the week."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search payroll..." />
      )}

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Weekly Payroll</DialogTitle>
          </DialogHeader>
          <GeneratePayrollForm onSuccess={() => setGenerateOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!markPaidTarget}
        onOpenChange={(open) => !open && setMarkPaidTarget(null)}
        title="Mark payroll as paid?"
        description={
          markPaidTarget
            ? `Confirm that ${markPaidTarget.employeeName}'s net salary of ${formatCurrency(
                markPaidTarget.netSalary
              )} has been paid out.`
            : undefined
        }
        confirmLabel="Mark as paid"
        destructive={false}
        onConfirm={handleMarkPaid}
      />
    </div>
  )
}
