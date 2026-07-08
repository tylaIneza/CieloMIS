import { prisma } from "@/lib/prisma"

export async function checkLowStock(inventoryItemId: number) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: inventoryItemId } })
  if (!item) return
  if (Number(item.currentStock) >= Number(item.minimumStock)) return

  const existing = await prisma.notification.findFirst({
    where: {
      type: "LOW_STOCK",
      relatedEntityType: "InventoryItem",
      relatedEntityId: inventoryItemId,
      isRead: false,
    },
  })
  if (existing) return

  await prisma.notification.create({
    data: {
      type: "LOW_STOCK",
      title: "Low stock alert",
      message: `${item.name} is below minimum stock (${Number(item.currentStock)}/${Number(
        item.minimumStock
      )} ${item.unit}).`,
      relatedEntityType: "InventoryItem",
      relatedEntityId: inventoryItemId,
    },
  })
}
