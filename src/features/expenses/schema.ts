import { z } from "zod"
import { paymentMethodValues } from "@/lib/constants"

export const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  categoryId: z.number().positive("Select a category"),
  item: z.string().min(1, "Item is required"),
  description: z.string().optional().or(z.literal("")),
  supplierId: z.number().optional().nullable(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unitPrice: z.number().nonnegative("Price can't be negative"),
  paymentMethod: z.enum(paymentMethodValues),
  receiptNumber: z.string().optional().or(z.literal("")),
  attachmentUrl: z.string().optional().or(z.literal("")),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
