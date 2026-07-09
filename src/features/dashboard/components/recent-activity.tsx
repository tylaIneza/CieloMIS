import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { History } from "lucide-react"

export interface ActivityEntry {
  id: number
  action: string
  entityType: string
  userName: string | null
  timestamp: Date
}

const actionLabels: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  UPDATE_STATUS: "changed status of",
  GENERATE: "generated",
  MARK_PAID: "marked paid",
  INCREASE: "increased",
  REPAYMENT: "recorded a repayment on",
  ADJUST_STOCK: "adjusted stock for",
  MAINTENANCE: "logged maintenance for",
  SEED: "seeded",
}

export function RecentActivity({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p>
                    <span className="font-medium">{entry.userName ?? "System"}</span>{" "}
                    {actionLabels[entry.action] ?? entry.action.toLowerCase()}{" "}
                    <span className="font-medium">{entry.entityType}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
