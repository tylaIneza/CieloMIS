import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"

interface LogActivityParams {
  action: string
  entityType: string
  entityId?: number
  previousValue?: Prisma.InputJsonValue
  newValue?: Prisma.InputJsonValue
}

export async function logActivity({
  action,
  entityType,
  entityId,
  previousValue,
  newValue,
}: LogActivityParams) {
  const session = await auth()
  await prisma.activityLog.create({
    data: {
      userId: session?.user?.id ? Number(session.user.id) : null,
      action,
      entityType,
      entityId,
      previousValue,
      newValue,
    },
  })
}
