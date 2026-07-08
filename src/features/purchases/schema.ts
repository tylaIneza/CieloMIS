import { z } from "zod"
import { paymentMethodValues } from "@/lib/constants"

export const purchaseItemSchema = z.object({
  inventoryItemId: z.number().positive("Select an item"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unitPrice: z.number().nonnegative("Price can't be negative"),
})

export const purchaseSchema = z.object({
  supplierId: z.number().positive("Select a supplier"),
  date: z.string().min(1, "Date is required"),
  invoiceNumber: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(paymentMethodValues),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
})

export type PurchaseFormValues = z.infer<typeof purchaseSchema>
