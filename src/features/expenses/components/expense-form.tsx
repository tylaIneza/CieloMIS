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
import { expenseSchema, type ExpenseFormValues } from "@/features/expenses/schema"
import { createExpense, updateExpense } from "@/features/expenses/actions"
import { paymentMethodValues, paymentMethodLabels } from "@/lib/constants"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}

interface ExpenseFormProps {
  expense?: {
    id: number
    date: Date
    categoryId: number
    item: string
    description: string | null
    supplierId: number | null
    quantity: number
    unitPrice: number
    paymentMethod: (typeof paymentMethodValues)[number]
    receiptNumber: string | null
    attachmentUrl: string | null
  } | null
  categories: Option[]
  suppliers: Option[]
  onSuccess: () => void
}

export function ExpenseForm({ expense, categories, suppliers, onSuccess }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          date: toDateInputValue(expense.date),
          categoryId: expense.categoryId,
          item: expense.item,
          description: expense.description ?? "",
          supplierId: expense.supplierId,
          quantity: expense.quantity,
          unitPrice: expense.unitPrice,
          paymentMethod: expense.paymentMethod,
          receiptNumber: expense.receiptNumber ?? "",
          attachmentUrl: expense.attachmentUrl ?? "",
        }
      : {
          date: toDateInputValue(new Date()),
          categoryId: 0,
          item: "",
          description: "",
          supplierId: null,
          quantity: 1,
          unitPrice: 0,
          paymentMethod: "CASH",
          receiptNumber: "",
          attachmentUrl: "",
        },
  })

  const isSubmitting = form.formState.isSubmitting
  const quantity = form.watch("quantity") || 0
  const unitPrice = form.watch("unitPrice") || 0

  async function onSubmit(values: ExpenseFormValues) {
    try {
      if (expense) {
        await updateExpense(expense.id, values)
        toast.success("Expense updated")
      } else {
        await createExpense(values)
        toast.success("Expense recorded")
      }
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <Input id="date" type="date" {...form.register("date")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="categoryId">Category</FieldLabel>
            <Select
              value={form.watch("categoryId") ? String(form.watch("categoryId")) : ""}
              onValueChange={(v) => form.setValue("categoryId", Number(v))}
            >
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.categoryId]} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="item">Item</FieldLabel>
          <Input id="item" {...form.register("item")} />
          <FieldError errors={[form.formState.errors.item]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" rows={2} {...form.register("description")} />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              {...form.register("quantity", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="unitPrice">Unit price (RWF)</FieldLabel>
            <Input
              id="unitPrice"
              type="number"
              min="0"
              {...form.register("unitPrice", { valueAsNumber: true })}
            />
          </Field>
        </Field>

        <p className="text-sm text-muted-foreground">
          Total cost:{" "}
          <span className="font-semibold text-foreground">
            RWF {(quantity * unitPrice).toLocaleString()}
          </span>
        </p>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="paymentMethod">Payment method</FieldLabel>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(v) =>
                form.setValue("paymentMethod", v as ExpenseFormValues["paymentMethod"])
              }
            >
              <SelectTrigger id="paymentMethod" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodValues.map((m) => (
                  <SelectItem key={m} value={m}>
                    {paymentMethodLabels[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="supplierId">Supplier</FieldLabel>
            <Select
              value={form.watch("supplierId") ? String(form.watch("supplierId")) : "none"}
              onValueChange={(v) => form.setValue("supplierId", v === "none" ? null : Number(v))}
            >
              <SelectTrigger id="supplierId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="receiptNumber">Receipt number</FieldLabel>
            <Input id="receiptNumber" {...form.register("receiptNumber")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="attachmentUrl">Attachment URL</FieldLabel>
            <Input id="attachmentUrl" placeholder="https://..." {...form.register("attachmentUrl")} />
          </Field>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : expense ? "Save changes" : "Record expense"}
        </Button>
      </FieldGroup>
    </form>
  )
}
