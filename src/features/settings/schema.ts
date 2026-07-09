import { z } from "zod"

export const settingsSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  currency: z.string().min(1, "Currency is required"),
  payrollDeductionPercent: z
    .number()
    .min(0, "Can't be negative")
    .max(100, "Can't exceed 100%"),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
