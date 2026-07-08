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
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import {
  inventoryItemSchema,
  inventoryCategoryValues,
  type InventoryItemFormValues,
} from "@/features/inventory/schema"
import { createInventoryItem, updateInventoryItem } from "@/features/inventory/actions"

interface Option {
  id: number
  name: string
}

const categoryLabels: Record<(typeof inventoryCategoryValues)[number], string> = {
  FABRIC: "Fabric",
  THREAD: "Thread",
  BUTTONS: "Buttons",
  ZIPPERS: "Zippers",
  ELASTIC: "Elastic",
  NEEDLES: "Needles",
  LABELS: "Labels",
  PACKAGING: "Packaging",
  LINING: "Lining",
  OTHER: "Other",
}

interface InventoryFormProps {
  item?: {
    id: number
    name: string
    category: (typeof inventoryCategoryValues)[number]
    unit: string
    purchasePrice: number
    supplierId: number | null
    minimumStock: number
    currentStock: number
    location: string | null
  } | null
  suppliers: Option[]
  onSuccess: () => void
}

export function InventoryForm({ item, suppliers, onSuccess }: InventoryFormProps) {
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          category: item.category,
          unit: item.unit,
          purchasePrice: item.purchasePrice,
          supplierId: item.supplierId,
          minimumStock: item.minimumStock,
          currentStock: item.currentStock,
          location: item.location ?? "",
        }
      : {
          name: "",
          category: "OTHER",
          unit: "",
          purchasePrice: 0,
          supplierId: null,
          minimumStock: 0,
          currentStock: 0,
          location: "",
        },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: InventoryItemFormValues) {
    try {
      if (item) {
        await updateInventoryItem(item.id, values)
        toast.success("Item updated")
      } else {
        await createInventoryItem(values)
        toast.success("Item added")
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
          <FieldLabel htmlFor="name">Item name</FieldLabel>
          <Input id="name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select
              value={form.watch("category")}
              onValueChange={(v) =>
                form.setValue("category", v as InventoryItemFormValues["category"])
              }
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inventoryCategoryValues.map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="unit">Unit</FieldLabel>
            <Input id="unit" placeholder="e.g. meters, pieces" {...form.register("unit")} />
            <FieldError errors={[form.formState.errors.unit]} />
          </Field>
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="minimumStock">Minimum stock</FieldLabel>
            <Input
              id="minimumStock"
              type="number"
              min="0"
              step="0.01"
              {...form.register("minimumStock", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="currentStock">Current stock</FieldLabel>
            <Input
              id="currentStock"
              type="number"
              min="0"
              step="0.01"
              {...form.register("currentStock", { valueAsNumber: true })}
              disabled={!!item}
            />
          </Field>
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="purchasePrice">Purchase price (RWF)</FieldLabel>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              {...form.register("purchasePrice", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input id="location" placeholder="e.g. Shelf A1" {...form.register("location")} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="supplierId">Preferred supplier</FieldLabel>
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
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : item ? "Save changes" : "Add item"}
        </Button>
      </FieldGroup>
    </form>
  )
}
