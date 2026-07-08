"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { supplierSchema, type SupplierFormValues } from "@/features/suppliers/schema"
import { createSupplier, updateSupplier } from "@/features/suppliers/actions"

interface SupplierFormProps {
  supplier?: {
    id: number
    name: string
    phone: string | null
    email: string | null
    address: string | null
    notes: string | null
  } | null
  onSuccess: () => void
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
          name: supplier.name,
          phone: supplier.phone ?? "",
          email: supplier.email ?? "",
          address: supplier.address ?? "",
          notes: supplier.notes ?? "",
        }
      : { name: "", phone: "", email: "", address: "", notes: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: SupplierFormValues) {
    try {
      if (supplier) {
        await updateSupplier(supplier.id, values)
        toast.success("Supplier updated")
      } else {
        await createSupplier(values)
        toast.success("Supplier added")
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
          <FieldLabel htmlFor="name">Supplier name</FieldLabel>
          <Input id="name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" {...form.register("phone")} />
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
          {isSubmitting ? "Saving..." : supplier ? "Save changes" : "Add supplier"}
        </Button>
      </FieldGroup>
    </form>
  )
}
