"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { maintenanceSchema, type MaintenanceFormValues } from "@/features/equipment/schema"
import { addMaintenance } from "@/features/equipment/actions"
import { toDateInputValue } from "@/lib/format"

export function MaintenanceForm({
  equipmentId,
  onSuccess,
}: {
  equipmentId: number
  onSuccess: () => void
}) {
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      date: toDateInputValue(new Date()),
      description: "",
      cost: 0,
      performedBy: "",
      nextMaintenanceDate: "",
      notes: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: MaintenanceFormValues) {
    try {
      await addMaintenance(equipmentId, values)
      toast.success("Maintenance record added")
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
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <Input id="date" type="date" {...form.register("date")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="cost">Cost (RWF)</FieldLabel>
            <Input
              id="cost"
              type="number"
              min="0"
              {...form.register("cost", { valueAsNumber: true })}
            />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" rows={2} {...form.register("description")} />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="performedBy">Performed by</FieldLabel>
            <Input id="performedBy" {...form.register("performedBy")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="nextMaintenanceDate">Next maintenance</FieldLabel>
            <Input id="nextMaintenanceDate" type="date" {...form.register("nextMaintenanceDate")} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Add maintenance record"}
        </Button>
      </FieldGroup>
    </form>
  )
}
