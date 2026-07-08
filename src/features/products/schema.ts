import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  paymentRate: z.number().positive("Rate must be greater than zero"),
  isActive: z.boolean(),
})

export type ProductFormValues = z.infer<typeof productSchema>
