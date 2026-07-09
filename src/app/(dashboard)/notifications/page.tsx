import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { NotificationList, type NotificationRow } from "@/features/notifications/components/notification-list"

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  })

  const rows: NotificationRow[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedEntityType: n.relatedEntityType,
    relatedEntityId: n.relatedEntityId,
    createdAt: n.createdAt,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Alerts for stock, orders, and loans" />
      <NotificationList data={rows} />
    </div>
  )
}
