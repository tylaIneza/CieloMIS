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
import {
  createOrderSchema,
  orderStatusValues,
  type CreateOrderValues,
} from "@/features/orders/schema"
import { createOrder } from "@/features/orders/actions"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}
interface ProductOption extends Option {
  paymentRate: number
}

const statusLabels: Record<(typeof orderStatusValues)[number], string> = {
  PENDING: "Pending",
  CUTTING: "Cutting",
  SEWING: "Sewing",
  IRONING: "Ironing",
  FINISHED: "Finished",
  DELIVERED: "Delivered",
}

const emptyItem = {
  productId: 0,
  quantity: 1,
  unitPrice: 0,
  measurement: {},
}

const measurementLabels: Record<string, string> = {
  chest: "Chest",
  waist: "Waist",
  hip: "Hip",
  shoulder: "Shoulder",
  sleeveLength: "Sleeve length",
  inseam: "Inseam",
  length: "Length",
  neck: "Neck",
}

export function OrderForm({
  customers,
  employees,
  products,
  onSuccess,
}: {
  customers: Option[]
  employees: Option[]
  products: ProductOption[]
  onSuccess: () => void
}) {
  const form = useForm<CreateOrderValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: 0,
      orderDate: toDateInputValue(new Date()),
      dueDate: toDateInputValue(new Date()),
      assignedEmployeeId: null,
      fabric: "",
      specialInstructions: "",
      status: "PENDING",
      deposit: 0,
      items: [emptyItem],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const isSubmitting = form.formState.isSubmitting
  const items = form.watch("items")
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  )

  async function onSubmit(values: CreateOrderValues) {
    try {
      await createOrder(values)
      toast.success("Order created")
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
            <FieldLabel htmlFor="customerId">Customer</FieldLabel>
            <Select
              value={form.watch("customerId") ? String(form.watch("customerId")) : ""}
              onValueChange={(v) => form.setValue("customerId", Number(v))}
            >
              <SelectTrigger id="customerId" className="w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.customerId]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="assignedEmployeeId">Assigned employee</FieldLabel>
            <Select
              value={
                form.watch("assignedEmployeeId")
                  ? String(form.watch("assignedEmployeeId"))
                  : "none"
              }
              onValueChange={(v) =>
                form.setValue("assignedEmployeeId", v === "none" ? null : Number(v))
              }
            >
              <SelectTrigger id="assignedEmployeeId" className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="orderDate">Order date</FieldLabel>
            <Input id="orderDate" type="date" {...form.register("orderDate")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input id="dueDate" type="date" {...form.register("dueDate")} />
            <FieldError errors={[form.formState.errors.dueDate]} />
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select
              value={form.watch("status")}
              onValueChange={(v) =>
                form.setValue("status", v as CreateOrderValues["status"])
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatusValues.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="fabric">Fabric</FieldLabel>
            <Input id="fabric" {...form.register("fabric")} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="specialInstructions">Special instructions</FieldLabel>
          <Textarea id="specialInstructions" rows={2} {...form.register("specialInstructions")} />
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
                <FieldLabel htmlFor={`items.${index}.productId`}>Product</FieldLabel>
                <Select
                  value={
                    form.watch(`items.${index}.productId`)
                      ? String(form.watch(`items.${index}.productId`))
                      : ""
                  }
                  onValueChange={(v) => {
                    const product = products.find((p) => p.id === Number(v))
                    form.setValue(`items.${index}.productId`, Number(v))
                    if (product) {
                      form.setValue(`items.${index}.unitPrice`, product.paymentRate)
                    }
                  }}
                >
                  <SelectTrigger id={`items.${index}.productId`} className="w-full">
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
                <FieldError errors={[form.formState.errors.items?.[index]?.productId]} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`items.${index}.quantity`}>Quantity</FieldLabel>
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min="1"
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

            <p className="text-xs font-medium text-muted-foreground">
              Measurements (cm, optional)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  "chest",
                  "waist",
                  "hip",
                  "shoulder",
                  "sleeveLength",
                  "inseam",
                  "length",
                  "neck",
                ] as const
              ).map((measurementKey) => (
                <Field key={measurementKey}>
                  <FieldLabel
                    htmlFor={`items.${index}.measurement.${measurementKey}`}
                    className="text-xs"
                  >
                    {measurementLabels[measurementKey]}
                  </FieldLabel>
                  <Input
                    id={`items.${index}.measurement.${measurementKey}`}
                    type="number"
                    step="0.1"
                    {...form.register(`items.${index}.measurement.${measurementKey}`, {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              ))}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(emptyItem)}
        >
          <Plus className="size-4" /> Add another item
        </Button>
        <FieldError errors={[form.formState.errors.items]} />

        <FieldSeparator />

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="deposit">Deposit (RWF)</FieldLabel>
            <Input
              id="deposit"
              type="number"
              min="0"
              {...form.register("deposit", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel>Total price</FieldLabel>
            <p className="flex h-9 items-center text-sm font-semibold">
              RWF {totalPrice.toLocaleString()}
            </p>
          </Field>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Create order"}
        </Button>
      </FieldGroup>
    </form>
  )
}
