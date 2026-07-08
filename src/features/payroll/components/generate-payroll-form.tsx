"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { generatePayrollSchema, type GeneratePayrollValues } from "@/features/payroll/schema"
import { generatePayroll } from "@/features/payroll/actions"
import { toDateInputValue } from "@/lib/format"

function fridayOfCurrentWeek() {
  const date = new Date()
  const day = date.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + mondayOffset)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return friday
}

export function GeneratePayrollForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<GeneratePayrollValues>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: { weekEnding: toDateInputValue(fridayOfCurrentWeek()) },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: GeneratePayrollValues) {
    try {
      const result = await generatePayroll(values)
      if (result.processed === 0) {
        toast.info("No new payroll to generate — all employees already covered for this week.")
      } else {
        toast.success(
          `Payroll generated for ${result.processed} employee(s)${
            result.skipped > 0 ? ` (${result.skipped} skipped — no unpaid production)` : ""
          }.`
        )
      }
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="weekEnding">Week ending (Friday)</FieldLabel>
          <Input id="weekEnding" type="date" {...form.register("weekEnding")} />
          <FieldDescription>
            Sums each active employee&apos;s unpaid production for that Mon–Fri week, deducts
            active loan installments, and marks the week as processed.
          </FieldDescription>
          <FieldError errors={[form.formState.errors.weekEnding]} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Generating..." : "Generate payroll"}
        </Button>
      </FieldGroup>
    </form>
  )
}
