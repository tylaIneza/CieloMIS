"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { loanAdjustmentSchema, type LoanAdjustmentValues } from "@/features/loans/schema"
import { increaseLoan, addRepayment } from "@/features/loans/actions"
import { toDateInputValue } from "@/lib/format"

export function LoanAdjustmentForm({
  loanId,
  mode,
  currentBalance,
  onSuccess,
}: {
  loanId: number
  mode: "increase" | "repayment"
  currentBalance: number
  onSuccess: () => void
}) {
  const form = useForm<LoanAdjustmentValues>({
    resolver: zodResolver(loanAdjustmentSchema),
    defaultValues: { amount: 0, date: toDateInputValue(new Date()), notes: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: LoanAdjustmentValues) {
    try {
      if (mode === "increase") {
        await increaseLoan(loanId, values)
        toast.success("Loan increased")
      } else {
        await addRepayment(loanId, values)
        toast.success("Repayment recorded")
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
          <FieldLabel htmlFor="amount">Amount (RWF)</FieldLabel>
          <Input
            id="amount"
            type="number"
            min="0"
            {...form.register("amount", { valueAsNumber: true })}
          />
          {mode === "repayment" && (
            <FieldDescription>
              Remaining balance: RWF {currentBalance.toLocaleString()}
            </FieldDescription>
          )}
          <FieldError errors={[form.formState.errors.amount]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <Input id="date" type="date" {...form.register("date")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? "Saving..."
            : mode === "increase"
              ? "Increase loan"
              : "Record repayment"}
        </Button>
      </FieldGroup>
    </form>
  )
}
