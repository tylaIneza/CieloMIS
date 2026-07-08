import { z } from "zod"

export const productionSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
      const day = new Date(val).getUTCDay()
      return day >= 1 && day <= 5
    }, "Production can only be recorded Monday through Friday"),
  employeeId: z.number().positive("Select an employee"),
  productId: z.number().positive("Select a product"),
  quantity: z.number().positive("Quantity must be at least 1"),
})

export type ProductionFormValues = z.infer<typeof productionSchema>
