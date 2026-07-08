import { z } from "zod"

export const generatePayrollSchema = z.object({
  weekEnding: z
    .string()
    .min(1, "Select a week-ending date")
    .refine((val) => new Date(val).getUTCDay() === 5, "Week ending must be a Friday"),
})

export type GeneratePayrollValues = z.infer<typeof generatePayrollSchema>
