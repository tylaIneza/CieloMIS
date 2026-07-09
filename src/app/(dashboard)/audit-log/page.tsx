import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { AuditLogTable } from "@/features/audit-log/components/audit-log-table"
import type { AuditLogRow } from "@/features/audit-log/components/columns"

export default async function AuditLogPage() {
  const entries = await prisma.activityLog.findMany({
    take: 500,
    orderBy: { timestamp: "desc" },
    include: { user: true },
  })

  const rows: AuditLogRow[] = entries.map((e) => ({
    id: e.id,
    action: e.action,
    entityType: e.entityType,
    entityId: e.entityId,
    userName: e.user?.name ?? null,
    previousValue: e.previousValue,
    newValue: e.newValue,
    timestamp: e.timestamp,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Full history of changes across the system" />
      <AuditLogTable data={rows} />
    </div>
  )
}
