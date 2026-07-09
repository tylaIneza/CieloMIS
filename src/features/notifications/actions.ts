"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function markNotificationRead(id: number, isRead: boolean) {
  await prisma.notification.update({ where: { id }, data: { isRead } })
  revalidatePath("/notifications")
}

export async function markAllNotificationsRead() {
  await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  })
  revalidatePath("/notifications")
}

export async function deleteNotification(id: number) {
  await prisma.notification.delete({ where: { id } })
  revalidatePath("/notifications")
}
