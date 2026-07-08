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
import {
  updateOrderSchema,
  orderStatusValues,
  type UpdateOrderValues,
} from "@/features/orders/schema"
import { updateOrder } from "@/features/orders/actions"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}

const statusLabels: Record<(typeof orderStatusValues)[number], string> = {
  PENDING: "Pending",
  CUTTING: "Cutting",
  SEWING: "Sewing",
  IRONING: "Ironing",
  FINISHED: "Finished",
  DELIVERED: "Delivered",
}

export interface OrderEditTarget {
  id: number
  orderNumber: string
  customerId: number
  orderDate: Date
  dueDate: Date
  assignedEmployeeId: number | null
  fabric: string | null
  specialInstructions: string | null
  status: (typeof orderStatusValues)[number]
  deposit: number
  totalPrice: number
}

export function OrderEditForm({
  order,
  customers,
  employees,
  onSuccess,
}: {
  order: OrderEditTarget
  customers: Option[]
  employees: Option[]
  onSuccess: () => void
}) {
  const form = useForm<UpdateOrderValues>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      customerId: order.customerId,
      orderDate: toDateInputValue(order.orderDate),
      dueDate: toDateInputValue(order.dueDate),
      assignedEmployeeId: order.assignedEmployeeId,
      fabric: order.fabric ?? "",
      specialInstructions: order.specialInstructions ?? "",
      status: order.status,
      deposit: order.deposit,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: UpdateOrderValues) {
    try {
      await updateOrder(order.id, values)
      toast.success("Order updated")
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
              value={String(form.watch("customerId"))}
              onValueChange={(v) => form.setValue("customerId", Number(v))}
            >
              <SelectTrigger id="customerId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectValue />
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
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select
              value={form.watch("status")}
              onValueChange={(v) =>
                form.setValue("status", v as UpdateOrderValues["status"])
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

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="deposit">Deposit (RWF)</FieldLabel>
            <Input
              id="deposit"
              type="number"
              min="0"
              max={order.totalPrice}
              {...form.register("deposit", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.deposit]} />
          </Field>
          <Field>
            <FieldLabel>Total price</FieldLabel>
            <p className="flex h-9 items-center text-sm font-semibold">
              RWF {order.totalPrice.toLocaleString()}
            </p>
          </Field>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  )
}
