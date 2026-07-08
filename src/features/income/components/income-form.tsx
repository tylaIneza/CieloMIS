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
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { incomeSchema, type IncomeFormValues } from "@/features/income/schema"
import { createIncome } from "@/features/income/actions"
import { paymentMethodValues, paymentMethodLabels } from "@/lib/constants"
import { toDateInputValue, formatCurrency } from "@/lib/format"

interface OrderOption {
  id: number
  orderNumber: string
  customerName: string
  remainingBalance: number
}

export function IncomeForm({
  orders,
  onSuccess,
}: {
  orders: OrderOption[]
  onSuccess: () => void
}) {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      orderId: 0,
      amount: 0,
      paymentMethod: "CASH",
      date: toDateInputValue(new Date()),
      invoiceNumber: "",
      notes: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const orderId = form.watch("orderId")
  const selectedOrder = orders.find((o) => o.id === orderId)

  async function onSubmit(values: IncomeFormValues) {
    try {
      await createIncome(values)
      toast.success("Payment recorded")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="orderId">Order</FieldLabel>
          <Select
            value={orderId ? String(orderId) : ""}
            onValueChange={(v) => form.setValue("orderId", Number(v))}
          >
            <SelectTrigger id="orderId" className="w-full">
              <SelectValue placeholder="Select an order with a balance due" />
            </SelectTrigger>
            <SelectContent>
              {orders.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.orderNumber} — {o.customerName} ({formatCurrency(o.remainingBalance)} due)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[form.formState.errors.orderId]} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="amount">Amount (RWF)</FieldLabel>
            <Input
              id="amount"
              type="number"
              min="0"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {selectedOrder && (
              <FieldDescription>
                Balance due: {formatCurrency(selectedOrder.remainingBalance)}
              </FieldDescription>
            )}
            <FieldError errors={[form.formState.errors.amount]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <Input id="date" type="date" {...form.register("date")} />
          </Field>
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="paymentMethod">Payment method</FieldLabel>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(v) =>
                form.setValue("paymentMethod", v as IncomeFormValues["paymentMethod"])
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
            <FieldLabel htmlFor="invoiceNumber">Invoice number</FieldLabel>
            <Input id="invoiceNumber" {...form.register("invoiceNumber")} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Record payment"}
        </Button>
      </FieldGroup>
    </form>
  )
}
