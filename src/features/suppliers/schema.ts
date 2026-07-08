import { z } from "zod"

export const supplierSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional().or(z.literal("")),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
