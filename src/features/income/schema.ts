import { z } from "zod"
import { paymentMethodValues } from "@/lib/constants"

export const incomeSchema = z.object({
  orderId: z.number().positive("Select an order"),
  amount: z.number().positive("Amount must be greater than zero"),
  paymentMethod: z.enum(paymentMethodValues),
  date: z.string().min(1, "Date is required"),
  invoiceNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type IncomeFormValues = z.infer<typeof incomeSchema>
