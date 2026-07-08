"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { productSchema, type ProductFormValues } from "@/features/products/schema"
import { createProduct, updateProduct } from "@/features/products/actions"

interface ProductFormProps {
  product?: {
    id: number
    name: string
    paymentRate: number
    isActive: boolean
  } | null
  onSuccess: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? { name: product.name, paymentRate: product.paymentRate, isActive: product.isActive }
      : { name: "", paymentRate: 0, isActive: true },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: ProductFormValues) {
    try {
      if (product) {
        await updateProduct(product.id, values)
        toast.success("Product updated")
      } else {
        await createProduct(values)
        toast.success("Product added")
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
          <FieldLabel htmlFor="name">Product name</FieldLabel>
          <Input id="name" placeholder="e.g. Women's Suit" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="paymentRate">Payment rate (RWF)</FieldLabel>
          <Input
            id="paymentRate"
            type="number"
            step="1"
            min="0"
            {...form.register("paymentRate", { valueAsNumber: true })}
          />
          <FieldError errors={[form.formState.errors.paymentRate]} />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="isActive">Active</FieldLabel>
          <Switch
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", checked)}
          />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : product ? "Save changes" : "Add product"}
        </Button>
      </FieldGroup>
    </form>
  )
}
