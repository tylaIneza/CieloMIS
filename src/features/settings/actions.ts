"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { settingsSchema, type SettingsFormValues } from "./schema"

export async function updateSettings(values: SettingsFormValues) {
  const data = settingsSchema.parse(values)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      businessName: data.businessName,
      logoUrl: data.logoUrl || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      currency: data.currency,
      payrollDeductionPercent: data.payrollDeductionPercent,
    },
    create: {
      id: 1,
      businessName: data.businessName,
      logoUrl: data.logoUrl || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      currency: data.currency,
      payrollDeductionPercent: data.payrollDeductionPercent,
    },
  })
  await logActivity({
    action: "UPDATE",
    entityType: "Settings",
    entityId: 1,
    newValue: data,
  })
  revalidatePath("/settings")
  revalidatePath("/payroll")
}
