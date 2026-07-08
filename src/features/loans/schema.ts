import { z } from "zod"

export const loanSchema = z.object({
  employeeId: z.number().positive("Select an employee"),
  amount: z.number().positive("Amount must be greater than zero"),
  issuedDate: z.string().min(1, "Date is required"),
  notes: z.string().optional().or(z.literal("")),
})

export type LoanFormValues = z.infer<typeof loanSchema>

export const loanAdjustmentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional().or(z.literal("")),
})

export type LoanAdjustmentValues = z.infer<typeof loanAdjustmentSchema>
