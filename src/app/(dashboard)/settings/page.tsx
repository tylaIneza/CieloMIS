import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { SettingsForm } from "@/features/settings/components/settings-form"
import type { SettingsFormValues } from "@/features/settings/schema"

export default async function SettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })

  const values: SettingsFormValues = {
    businessName: settings?.businessName ?? "Cielo Fashion Boutique",
    logoUrl: settings?.logoUrl ?? "",
    phone: settings?.phone ?? "",
    email: settings?.email ?? "",
    address: settings?.address ?? "",
    currency: settings?.currency ?? "RWF",
    payrollDeductionPercent: Number(settings?.payrollDeductionPercent ?? 30),
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Business profile and payroll configuration" />
      <SettingsForm settings={values} />
    </div>
  )
}
