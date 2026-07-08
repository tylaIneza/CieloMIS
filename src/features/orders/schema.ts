import { z } from "zod"

export const orderStatusValues = [
  "PENDING",
  "CUTTING",
  "SEWING",
  "IRONING",
  "FINISHED",
  "DELIVERED",
] as const

export const measurementSchema = z.object({
  chest: z.number().optional(),
  waist: z.number().optional(),
  hip: z.number().optional(),
  shoulder: z.number().optional(),
  sleeveLength: z.number().optional(),
  inseam: z.number().optional(),
  length: z.number().optional(),
  neck: z.number().optional(),
  notes: z.string().optional().or(z.literal("")),
})

export type MeasurementValues = z.infer<typeof measurementSchema>

export const orderItemSchema = z.object({
  productId: z.number().positive("Select a product"),
  quantity: z.number().positive("Quantity must be at least 1"),
  unitPrice: z.number().nonnegative("Price can't be negative"),
  measurement: measurementSchema.optional(),
})

export const createOrderSchema = z.object({
  customerId: z.number().positive("Select a customer"),
  orderDate: z.string().min(1, "Order date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignedEmployeeId: z.number().optional().nullable(),
  fabric: z.string().optional().or(z.literal("")),
  specialInstructions: z.string().optional().or(z.literal("")),
  status: z.enum(orderStatusValues),
  deposit: z.number().nonnegative("Deposit can't be negative"),
  items: z.array(orderItemSchema).min(1, "Add at least one item"),
})

export type CreateOrderValues = z.infer<typeof createOrderSchema>

export const updateOrderSchema = z.object({
  customerId: z.number().positive("Select a customer"),
  orderDate: z.string().min(1, "Order date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignedEmployeeId: z.number().optional().nullable(),
  fabric: z.string().optional().or(z.literal("")),
  specialInstructions: z.string().optional().or(z.literal("")),
  status: z.enum(orderStatusValues),
  deposit: z.number().nonnegative("Deposit can't be negative"),
})

export type UpdateOrderValues = z.infer<typeof updateOrderSchema>
