import { z } from "zod"

export const inventoryCategoryValues = [
  "FABRIC",
  "THREAD",
  "BUTTONS",
  "ZIPPERS",
  "ELASTIC",
  "NEEDLES",
  "LABELS",
  "PACKAGING",
  "LINING",
  "OTHER",
] as const

export const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum(inventoryCategoryValues),
  unit: z.string().min(1, "Unit is required"),
  purchasePrice: z.number().nonnegative("Price can't be negative"),
  supplierId: z.number().optional().nullable(),
  minimumStock: z.number().nonnegative("Minimum stock can't be negative"),
  currentStock: z.number().nonnegative("Current stock can't be negative"),
  location: z.string().optional().or(z.literal("")),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>

export const stockAdjustmentSchema = z.object({
  newQuantity: z.number().nonnegative("Quantity can't be negative"),
  reason: z.string().min(1, "Reason is required"),
})

export type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>
