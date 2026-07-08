"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { auth } from "@/lib/auth"
import { purchaseSchema, type PurchaseFormValues } from "./schema"

export async function createPurchase(values: PurchaseFormValues) {
  const data = purchaseSchema.parse(values)
  const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const session = await auth()
  const recordedById = session?.user?.id ? Number(session.user.id) : null

  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.purchase.create({
      data: {
        supplierId: data.supplierId,
        date: new Date(data.date),
        invoiceNumber: data.invoiceNumber || null,
        totalAmount,
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        recordedById,
        items: {
          create: data.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
    })

    for (const item of data.items) {
      await tx.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: { currentStock: { increment: item.quantity } },
      })
      await tx.stockMovement.create({
        data: {
          inventoryItemId: item.inventoryItemId,
          type: "IN",
          quantity: item.quantity,
          reason: `Purchase${data.invoiceNumber ? ` ${data.invoiceNumber}` : ""}`,
          purchaseId: created.id,
          date: new Date(data.date),
          recordedById,
        },
      })
    }

    return created
  })

  await logActivity({
    action: "CREATE",
    entityType: "Purchase",
    entityId: purchase.id,
    newValue: { totalAmount, itemCount: data.items.length },
  })
  revalidatePath("/purchases")
  revalidatePath("/inventory")
  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { id: purchase.id }
}
