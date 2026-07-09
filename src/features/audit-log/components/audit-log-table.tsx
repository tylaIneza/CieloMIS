"use client"

import { useMemo, useState } from "react"
import { History } from "lucide-react"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { buildAuditLogColumns, type AuditLogRow } from "./columns"

export function AuditLogTable({ data }: { data: AuditLogRow[] }) {
  const [detailsTarget, setDetailsTarget] = useState<AuditLogRow | null>(null)

  const columns = useMemo(
    () => buildAuditLogColumns({ onViewDetails: (row) => setDetailsTarget(row) }),
    []
  )

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity recorded yet"
          description="Every create, update, and delete across the system will show up here."
        />
      ) : (
        <DataTable columns={columns} data={data} searchPlaceholder="Search activity..." />
      )}

      <Dialog open={!!detailsTarget} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Activity details — {detailsTarget?.entityType}
              {detailsTarget?.entityId ? ` #${detailsTarget.entityId}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {detailsTarget?.previousValue ? (
              <div>
                <p className="mb-1 font-medium text-muted-foreground">Previous value</p>
                <pre className="overflow-x-auto rounded-lg border bg-muted p-3 text-xs">
                  {JSON.stringify(detailsTarget.previousValue, null, 2)}
                </pre>
              </div>
            ) : null}
            {detailsTarget?.newValue ? (
              <div>
                <p className="mb-1 font-medium text-muted-foreground">New value</p>
                <pre className="overflow-x-auto rounded-lg border bg-muted p-3 text-xs">
                  {JSON.stringify(detailsTarget.newValue, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
