import { z } from "zod"

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
