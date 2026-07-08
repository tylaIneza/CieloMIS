import { z } from "zod"

export const equipmentCategoryValues = [
  "SEWING_MACHINE",
  "OVERLOCK_MACHINE",
  "EMBROIDERY_MACHINE",
  "STEAM_IRON",
  "CUTTING_TABLE",
  "FURNITURE",
  "OTHER",
] as const

export const equipmentConditionValues = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "OUT_OF_SERVICE",
] as const

export const equipmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum(equipmentCategoryValues),
  brand: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  serialNumber: z.string().optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  purchasePrice: z.number().nonnegative("Price can't be negative"),
  warrantyExpiry: z.string().optional().or(z.literal("")),
  supplierId: z.number().optional().nullable(),
  condition: z.enum(equipmentConditionValues),
})

export type EquipmentFormValues = z.infer<typeof equipmentSchema>

export const maintenanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  cost: z.number().nonnegative("Cost can't be negative"),
  performedBy: z.string().optional().or(z.literal("")),
  nextMaintenanceDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>
