"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { productionSchema, type ProductionFormValues } from "@/features/production/schema"
import { createProduction } from "@/features/production/actions"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}
interface ProductOption extends Option {
  paymentRate: number
}

function isWeekday(date: Date) {
  const day = date.getUTCDay()
  return day >= 1 && day <= 5
}

function nearestWeekday() {
  const date = new Date()
  while (!isWeekday(date)) {
    date.setDate(date.getDate() - 1)
  }
  return date
}

export function ProductionForm({
  employees,
  products,
  onSuccess,
}: {
  employees: Option[]
  products: ProductOption[]
  onSuccess: () => void
}) {
  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      date: toDateInputValue(nearestWeekday()),
      employeeId: 0,
      productId: 0,
      quantity: 1,
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const productId = form.watch("productId")
  const quantity = form.watch("quantity") || 0
  const selectedProduct = products.find((p) => p.id === productId)
  const total = (selectedProduct?.paymentRate ?? 0) * quantity

  async function onSubmit(values: ProductionFormValues) {
    try {
      await createProduction(values)
      toast.success("Production recorded")
      form.reset({
        date: values.date,
        employeeId: values.employeeId,
        productId: 0,
        quantity: 1,
      })
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <Input id="date" type="date" {...form.register("date")} />
          <FieldDescription>Production is only recorded Monday–Friday.</FieldDescription>
          <FieldError errors={[form.formState.errors.date]} />
        </Field>
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
            <FieldLabel htmlFor="productId">Product</FieldLabel>
            <Select
              value={productId ? String(productId) : ""}
              onValueChange={(v) => form.setValue("productId", Number(v))}
            >
              <SelectTrigger id="productId" className="w-full">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.productId]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...form.register("quantity", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.quantity]} />
          </Field>
        </Field>

        {selectedProduct && (
          <p className="text-sm text-muted-foreground">
            {quantity} × RWF {selectedProduct.paymentRate.toLocaleString()} ={" "}
            <span className="font-semibold text-foreground">
              RWF {total.toLocaleString()}
            </span>
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Record production"}
        </Button>
      </FieldGroup>
    </form>
  )
}
