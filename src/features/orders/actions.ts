"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import {
  createOrderSchema,
  updateOrderSchema,
  orderStatusValues,
  type CreateOrderValues,
  type UpdateOrderValues,
  type MeasurementValues,
} from "./schema"

function hasMeasurementValues(measurement?: MeasurementValues) {
  if (!measurement) return false
  return Object.entries(measurement).some(([key, value]) => {
    if (key === "notes") return typeof value === "string" && value.trim().length > 0
    return typeof value === "number" && !Number.isNaN(value)
  })
}

async function generateOrderNumber() {
  const year = new Date().getFullYear()
  const prefix = `ORD-${year}-`
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  })
  return `${prefix}${String(count + 1).padStart(4, "0")}`
}

export async function createOrder(values: CreateOrderValues) {
  const data = createOrderSchema.parse(values)
  const totalPrice = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const remainingBalance = totalPrice - data.deposit
  const orderNumber = await generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: data.customerId,
      orderDate: new Date(data.orderDate),
      dueDate: new Date(data.dueDate),
      assignedEmployeeId: data.assignedEmployeeId || null,
      fabric: data.fabric || null,
      specialInstructions: data.specialInstructions || null,
      status: data.status,
      totalPrice,
      deposit: data.deposit,
      remainingBalance,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
          measurement: hasMeasurementValues(item.measurement)
            ? {
                create: {
                  chest: item.measurement?.chest,
                  waist: item.measurement?.waist,
                  hip: item.measurement?.hip,
                  shoulder: item.measurement?.shoulder,
                  sleeveLength: item.measurement?.sleeveLength,
                  inseam: item.measurement?.inseam,
                  length: item.measurement?.length,
                  neck: item.measurement?.neck,
                  notes: item.measurement?.notes || null,
                },
              }
            : undefined,
        })),
      },
    },
  })

  if (data.deposit > 0) {
    await prisma.customerPayment.create({
      data: {
        orderId: order.id,
        customerId: data.customerId,
        amount: data.deposit,
        paymentMethod: "CASH",
        date: new Date(data.orderDate),
        notes: "Initial deposit",
      },
    })
  }

  await logActivity({
    action: "CREATE",
    entityType: "Order",
    entityId: order.id,
    newValue: { orderNumber, totalPrice, deposit: data.deposit },
  })
  revalidatePath("/orders")
  revalidatePath("/income")
  return { id: order.id }
}

export async function updateOrder(id: number, values: UpdateOrderValues) {
  const data = updateOrderSchema.parse(values)
  const existing = await prisma.order.findUniqueOrThrow({ where: { id } })
  const remainingBalance = Number(existing.totalPrice) - data.deposit

  const order = await prisma.order.update({
    where: { id },
    data: {
      customerId: data.customerId,
      orderDate: new Date(data.orderDate),
      dueDate: new Date(data.dueDate),
      assignedEmployeeId: data.assignedEmployeeId || null,
      fabric: data.fabric || null,
      specialInstructions: data.specialInstructions || null,
      status: data.status,
      deposit: data.deposit,
      remainingBalance,
    },
  })

  await logActivity({
    action: "UPDATE",
    entityType: "Order",
    entityId: id,
    newValue: { status: data.status, deposit: data.deposit },
  })
  revalidatePath("/orders")
  return { id: order.id }
}

export async function updateOrderStatus(id: number, status: (typeof orderStatusValues)[number]) {
  await prisma.order.update({ where: { id }, data: { status } })
  await logActivity({
    action: "UPDATE_STATUS",
    entityType: "Order",
    entityId: id,
    newValue: { status },
  })
  revalidatePath("/orders")
}

export async function deleteOrder(id: number) {
  try {
    await prisma.order.delete({ where: { id } })
  } catch {
    return { error: "This order has linked payments and can't be deleted." }
  }
  await logActivity({ action: "DELETE", entityType: "Order", entityId: id })
  revalidatePath("/orders")
}
