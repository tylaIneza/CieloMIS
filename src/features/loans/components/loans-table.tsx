"use client"

import { useMemo, useState } from "react"
import { Plus, HandCoins } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { formatCurrency, formatDate } from "@/lib/format"
import { buildLoanColumns, type LoanRow } from "./columns"
import { LoanForm } from "./loan-form"
import { LoanAdjustmentForm } from "./loan-adjustment-form"
import { deleteLoan } from "@/features/loans/actions"

interface Option {
  id: number
  name: string
}

export function LoansTable({ data, employees }: { data: LoanRow[]; employees: Option[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState<{ row: LoanRow; mode: "increase" | "repayment" } | null>(null)
  const [historyTarget, setHistoryTarget] = useState<LoanRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LoanRow | null>(null)

  const columns = useMemo(
    () =>
      buildLoanColumns({
        onIncrease: (row) => setAdjustTarget({ row, mode: "increase" }),
        onRepay: (row) => setAdjustTarget({ row, mode: "repayment" }),
        onHistory: (row) => setHistoryTarget(row),
        onDelete: (row) => setDeleteTarget(row),
      }),
    []
  )

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const result = await deleteLoan(deleteTarget.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Loan deleted")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete loan")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Add Loan
        </Button>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="No loans yet"
          description="Issue an employee loan to start tracking repayments."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search loans..." />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Loan</DialogTitle>
          </DialogHeader>
          <LoanForm employees={employees} onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!adjustTarget} onOpenChange={(open) => !open && setAdjustTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {adjustTarget?.mode === "increase" ? "Increase Loan" : "Record Repayment"} —{" "}
              {adjustTarget?.row.employeeName}
            </DialogTitle>
          </DialogHeader>
          {adjustTarget && (
            <LoanAdjustmentForm
              loanId={adjustTarget.row.id}
              mode={adjustTarget.mode}
              currentBalance={adjustTarget.row.balance}
              onSuccess={() => setAdjustTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!historyTarget} onOpenChange={(open) => !open && setHistoryTarget(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loan Statement — {historyTarget?.employeeName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>Original amount</span>
              <span className="font-medium">
                {historyTarget && formatCurrency(historyTarget.amount)}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted p-3">
              <span>Remaining balance</span>
              <span className="font-medium">
                {historyTarget && formatCurrency(historyTarget.balance)}
              </span>
            </div>
            {historyTarget?.payments.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">No repayments recorded yet.</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {historyTarget?.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.date)} ·{" "}
                        {p.source === "PAYROLL_DEDUCTION" ? "Payroll deduction" : "Manual repayment"}
                      </p>
                    </div>
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
        title="Delete loan?"
        description={`This will permanently delete this loan for ${deleteTarget?.employeeName}.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
