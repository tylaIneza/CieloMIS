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
  equipmentSchema,
  equipmentCategoryValues,
  equipmentConditionValues,
  type EquipmentFormValues,
} from "@/features/equipment/schema"
import { createEquipment, updateEquipment } from "@/features/equipment/actions"
import { toDateInputValue } from "@/lib/format"

interface Option {
  id: number
  name: string
}

const categoryLabels: Record<(typeof equipmentCategoryValues)[number], string> = {
  SEWING_MACHINE: "Sewing Machine",
  OVERLOCK_MACHINE: "Overlock Machine",
  EMBROIDERY_MACHINE: "Embroidery Machine",
  STEAM_IRON: "Steam Iron",
  CUTTING_TABLE: "Cutting Table",
  FURNITURE: "Furniture",
  OTHER: "Other",
}

const conditionLabels: Record<(typeof equipmentConditionValues)[number], string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  OUT_OF_SERVICE: "Out of Service",
}

interface EquipmentFormProps {
  equipment?: {
    id: number
    name: string
    category: (typeof equipmentCategoryValues)[number]
    brand: string | null
    model: string | null
    serialNumber: string | null
    purchaseDate: Date | null
    purchasePrice: number
    warrantyExpiry: Date | null
    supplierId: number | null
    condition: (typeof equipmentConditionValues)[number]
  } | null
  suppliers: Option[]
  onSuccess: () => void
}

export function EquipmentForm({ equipment, suppliers, onSuccess }: EquipmentFormProps) {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipment
      ? {
          name: equipment.name,
          category: equipment.category,
          brand: equipment.brand ?? "",
          model: equipment.model ?? "",
          serialNumber: equipment.serialNumber ?? "",
          purchaseDate: equipment.purchaseDate ? toDateInputValue(equipment.purchaseDate) : "",
          purchasePrice: equipment.purchasePrice,
          warrantyExpiry: equipment.warrantyExpiry
            ? toDateInputValue(equipment.warrantyExpiry)
            : "",
          supplierId: equipment.supplierId,
          condition: equipment.condition,
        }
      : {
          name: "",
          category: "SEWING_MACHINE",
          brand: "",
          model: "",
          serialNumber: "",
          purchaseDate: "",
          purchasePrice: 0,
          warrantyExpiry: "",
          supplierId: null,
          condition: "GOOD",
        },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: EquipmentFormValues) {
    try {
      if (equipment) {
        await updateEquipment(equipment.id, values)
        toast.success("Equipment updated")
      } else {
        await createEquipment(values)
        toast.success("Equipment added")
      }
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
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" {...form.register("name")} />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select
              value={form.watch("category")}
              onValueChange={(v) =>
                form.setValue("category", v as EquipmentFormValues["category"])
              }
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {equipmentCategoryValues.map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoryLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="brand">Brand</FieldLabel>
            <Input id="brand" {...form.register("brand")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="model">Model</FieldLabel>
            <Input id="model" {...form.register("model")} />
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="serialNumber">Serial number</FieldLabel>
            <Input id="serialNumber" {...form.register("serialNumber")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="condition">Condition</FieldLabel>
            <Select
              value={form.watch("condition")}
              onValueChange={(v) =>
                form.setValue("condition", v as EquipmentFormValues["condition"])
              }
            >
              <SelectTrigger id="condition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {equipmentConditionValues.map((c) => (
                  <SelectItem key={c} value={c}>
                    {conditionLabels[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="purchaseDate">Purchase date</FieldLabel>
            <Input id="purchaseDate" type="date" {...form.register("purchaseDate")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="purchasePrice">Purchase price (RWF)</FieldLabel>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              {...form.register("purchasePrice", { valueAsNumber: true })}
            />
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="warrantyExpiry">Warranty expiry</FieldLabel>
            <Input id="warrantyExpiry" type="date" {...form.register("warrantyExpiry")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="supplierId">Supplier</FieldLabel>
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
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : equipment ? "Save changes" : "Add equipment"}
        </Button>
      </FieldGroup>
    </form>
  )
}
