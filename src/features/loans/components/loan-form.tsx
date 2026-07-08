"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { loanSchema, type LoanFormValues } from "@/features/loans/schema"
import { createLoan } from "@/features/loans/actions"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}

export function LoanForm({
  employees,
  onSuccess,
}: {
  employees: Option[]
  onSuccess: () => void
}) {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      employeeId: 0,
      amount: 0,
      issuedDate: toDateInputValue(new Date()),
      notes: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: LoanFormValues) {
    try {
      await createLoan(values)
      toast.success("Loan added")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="employeeId">Employee</FieldLabel>
          <Select
            value={form.watch("employeeId") ? String(form.watch("employeeId")) : ""}
            onValueChange={(v) => form.setValue("employeeId", Number(v))}
          >
            <SelectTrigger id="employeeId" className="w-full">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[form.formState.errors.employeeId]} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="amount">Loan amount (RWF)</FieldLabel>
            <Input
              id="amount"
              type="number"
              min="0"
              {...form.register("amount", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.amount]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="issuedDate">Date issued</FieldLabel>
            <Input id="issuedDate" type="date" {...form.register("issuedDate")} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Add loan"}
        </Button>
      </FieldGroup>
    </form>
  )
}
