"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { customerSchema, type CustomerFormValues } from "@/features/customers/schema"
import { createCustomer, updateCustomer } from "@/features/customers/actions"

interface CustomerFormProps {
  customer?: {
    id: number
    name: string
    phone: string
    email: string | null
    address: string | null
    notes: string | null
  } | null
  onSuccess: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? "",
          address: customer.address ?? "",
          notes: customer.notes ?? "",
        }
      : { name: "", phone: "", email: "", address: "", notes: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: CustomerFormValues) {
    try {
      if (customer) {
        await updateCustomer(customer.id, values)
        toast.success("Customer updated")
      } else {
        await createCustomer(values)
        toast.success("Customer added")
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
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input id="name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" {...form.register("phone")} />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input id="address" {...form.register("address")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : customer ? "Save changes" : "Add customer"}
        </Button>
      </FieldGroup>
    </form>
  )
}
