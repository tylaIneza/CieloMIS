"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { stockAdjustmentSchema, type StockAdjustmentValues } from "@/features/inventory/schema"
import { adjustStock } from "@/features/inventory/actions"

export function AdjustStockForm({
  itemId,
  currentStock,
  unit,
  onSuccess,
}: {
  itemId: number
  currentStock: number
  unit: string
  onSuccess: () => void
}) {
  const form = useForm<StockAdjustmentValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { newQuantity: currentStock, reason: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: StockAdjustmentValues) {
    try {
      await adjustStock(itemId, values)
      toast.success("Stock adjusted")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="newQuantity">New quantity ({unit})</FieldLabel>
          <Input
            id="newQuantity"
            type="number"
            min="0"
            step="0.01"
            {...form.register("newQuantity", { valueAsNumber: true })}
          />
          <FieldDescription>Current recorded stock: {currentStock} {unit}</FieldDescription>
          <FieldError errors={[form.formState.errors.newQuantity]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="reason">Reason</FieldLabel>
          <Input
            id="reason"
            placeholder="e.g. Physical count correction"
            {...form.register("reason")}
          />
          <FieldError errors={[form.formState.errors.reason]} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save adjustment"}
        </Button>
      </FieldGroup>
    </form>
  )
}
