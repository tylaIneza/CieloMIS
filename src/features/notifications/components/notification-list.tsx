"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  HandCoins,
  MoreHorizontal,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/features/notifications/actions"

export type NotificationType =
  | "PAYROLL_REMINDER"
  | "LOW_STOCK"
  | "LOAN_PAID"
  | "ORDER_DUE"
  | "EQUIPMENT_MAINTENANCE"

export interface NotificationRow {
  id: number
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedEntityType: string | null
  relatedEntityId: number | null
  createdAt: Date
}

const typeIcons: Record<NotificationType, LucideIcon> = {
  PAYROLL_REMINDER: Wallet,
  LOW_STOCK: AlertTriangle,
  LOAN_PAID: HandCoins,
  ORDER_DUE: CalendarClock,
  EQUIPMENT_MAINTENANCE: Wrench,
}

const entityRoutes: Record<string, string> = {
  InventoryItem: "/inventory",
  Loan: "/loans",
  Order: "/orders",
  Equipment: "/equipment",
  Payroll: "/payroll",
}

type Filter = "all" | "unread"

export function NotificationList({ data }: { data: NotificationRow[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [deleteTarget, setDeleteTarget] = useState<NotificationRow | null>(null)

  const unreadCount = useMemo(() => data.filter((n) => !n.isRead).length, [data])
  const visible = useMemo(
    () => (filter === "unread" ? data.filter((n) => !n.isRead) : data),
    [data, filter]
  )

  async function handleToggleRead(row: NotificationRow) {
    try {
      await markNotificationRead(row.id, !row.isRead)
    } catch {
      toast.error("Could not update notification")
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead()
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Could not mark notifications as read")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteNotification(deleteTarget.id)
      toast.success("Notification deleted")
    } catch {
      toast.error("Could not delete notification")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread{unreadCount > 0 && ` (${unreadCount})`}
          </Button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description="Alerts for low stock, order due dates, and loan repayments will show up here."
        />
      ) : (
        <div className="divide-y rounded-lg border">
          {visible.map((n) => {
            const Icon = typeIcons[n.type]
            const href =
              n.relatedEntityType && entityRoutes[n.relatedEntityType]
                ? entityRoutes[n.relatedEntityType]
                : null
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 p-4 text-sm",
                  !n.isRead && "bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-full p-2",
                    n.isRead ? "bg-muted" : "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      n.isRead ? "text-muted-foreground" : "text-primary"
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-medium", !n.isRead && "text-foreground")}>
                      {n.title}
                    </p>
                    {!n.isRead && <Badge variant="default">New</Badge>}
                  </div>
                  <p className="text-muted-foreground">{n.message}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDateTime(n.createdAt)}</span>
                    {href && (
                      <Link href={href} className="font-medium text-primary hover:underline">
                        View details
                      </Link>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Notification actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleRead(n)}>
                      {n.isRead ? "Mark as unread" : "Mark as read"}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(n)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete notification?"
        description="This notification will be permanently removed."
        onConfirm={handleDelete}
      />
    </div>
  )
}
