import { z } from "zod"

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  address: z.string().optional().or(z.literal("")),
  position: z.string().min(2, "Position is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  photoUrl: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>
