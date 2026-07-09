"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { settingsSchema, type SettingsFormValues } from "@/features/settings/schema"
import { updateSettings } from "@/features/settings/actions"

export function SettingsForm({ settings }: { settings: SettingsFormValues }) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: SettingsFormValues) {
    try {
      await updateSettings(values)
      toast.success("Settings saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="businessName">Business name</FieldLabel>
                <Input id="businessName" {...form.register("businessName")} />
                <FieldError errors={[form.formState.errors.businessName]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="currency">Currency</FieldLabel>
                <Input id="currency" {...form.register("currency")} />
                <FieldError errors={[form.formState.errors.currency]} />
              </Field>
            </Field>

            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" {...form.register("phone")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input id="address" {...form.register("address")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="logoUrl">Logo URL</FieldLabel>
              <Input id="logoUrl" placeholder="https://..." {...form.register("logoUrl")} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="payrollDeductionPercent">
                Loan deduction percentage
              </FieldLabel>
              <Input
                id="payrollDeductionPercent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...form.register("payrollDeductionPercent", { valueAsNumber: true })}
              />
              <FieldDescription>
                Share of net salary automatically deducted each pay run to repay active
                employee loans.
              </FieldDescription>
              <FieldError errors={[form.formState.errors.payrollDeductionPercent]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  )
}
