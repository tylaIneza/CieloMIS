"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
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
import { Field, FieldLabel, FieldError, FieldGroup, FieldSeparator } from "@/components/ui/field"
import { purchaseSchema, type PurchaseFormValues } from "@/features/purchases/schema"
import { createPurchase } from "@/features/purchases/actions"
import { paymentMethodValues, paymentMethodLabels } from "@/lib/constants"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}
interface InventoryOption extends Option {
  purchasePrice: number
  unit: string
}

const emptyItem = { inventoryItemId: 0, quantity: 1, unitPrice: 0 }

export function PurchaseForm({
  suppliers,
  inventoryItems,
  onSuccess,
}: {
  suppliers: Option[]
  inventoryItems: InventoryOption[]
  onSuccess: () => void
}) {
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: 0,
      date: toDateInputValue(new Date()),
      invoiceNumber: "",
      paymentMethod: "CASH",
      notes: "",
      items: [emptyItem],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const isSubmitting = form.formState.isSubmitting
  const items = form.watch("items")
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  )

  async function onSubmit(values: PurchaseFormValues) {
    try {
      await createPurchase(values)
      toast.success("Purchase recorded and stock updated")
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
            <FieldLabel htmlFor="supplierId">Supplier</FieldLabel>
            <Select
              value={form.watch("supplierId") ? String(form.watch("supplierId")) : ""}
              onValueChange={(v) => form.setValue("supplierId", Number(v))}
            >
              <SelectTrigger id="supplierId" className="w-full">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.supplierId]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <Input id="date" type="date" {...form.register("date")} />
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="invoiceNumber">Invoice number</FieldLabel>
            <Input id="invoiceNumber" {...form.register("invoiceNumber")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="paymentMethod">Payment method</FieldLabel>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(v) =>
                form.setValue("paymentMethod", v as PurchaseFormValues["paymentMethod"])
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
        </Field>

        <FieldSeparator>Items</FieldSeparator>

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Item {index + 1}</p>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="Remove item"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor={`items.${index}.inventoryItemId`}>Item</FieldLabel>
                <Select
                  value={
                    form.watch(`items.${index}.inventoryItemId`)
                      ? String(form.watch(`items.${index}.inventoryItemId`))
                      : ""
                  }
                  onValueChange={(v) => {
                    const inv = inventoryItems.find((i) => i.id === Number(v))
                    form.setValue(`items.${index}.inventoryItemId`, Number(v))
                    if (inv) form.setValue(`items.${index}.unitPrice`, inv.purchasePrice)
                  }}
                >
                  <SelectTrigger id={`items.${index}.inventoryItemId`} className="w-full">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.items?.[index]?.inventoryItemId]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`items.${index}.quantity`}>Quantity</FieldLabel>
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`items.${index}.unitPrice`}>Unit price</FieldLabel>
                <Input
                  id={`items.${index}.unitPrice`}
                  type="number"
                  min="0"
                  {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
              </Field>
            </Field>
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem)}>
          <Plus className="size-4" /> Add another item
        </Button>
        <FieldError errors={[form.formState.errors.items]} />

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm font-semibold">
          <span>Total amount</span>
          <span>RWF {totalAmount.toLocaleString()}</span>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Record purchase"}
        </Button>
      </FieldGroup>
    </form>
  )
}
