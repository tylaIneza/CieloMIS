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
import { employeeSchema, type EmployeeFormValues } from "@/features/employees/schema"
import { createEmployee, updateEmployee } from "@/features/employees/actions"
import { toDateInputValue } from "@/lib/format"

interface EmployeeFormProps {
  employee?: {
    id: number
    name: string
    phone: string
    address: string | null
    position: string
    hireDate: Date
    status: "ACTIVE" | "INACTIVE"
    photoUrl: string | null
    notes: string | null
  } | null
  onSuccess: () => void
}

export function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          name: employee.name,
          phone: employee.phone,
          address: employee.address ?? "",
          position: employee.position,
          hireDate: toDateInputValue(employee.hireDate),
          status: employee.status,
          photoUrl: employee.photoUrl ?? "",
          notes: employee.notes ?? "",
        }
      : {
          name: "",
          phone: "",
          address: "",
          position: "",
          hireDate: toDateInputValue(new Date()),
          status: "ACTIVE",
          photoUrl: "",
          notes: "",
        },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: EmployeeFormValues) {
    try {
      if (employee) {
        await updateEmployee(employee.id, values)
        toast.success("Employee updated")
      } else {
        await createEmployee(values)
        toast.success("Employee added")
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
            <FieldLabel htmlFor="position">Position</FieldLabel>
            <Input id="position" {...form.register("position")} />
            <FieldError errors={[form.formState.errors.position]} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input id="address" {...form.register("address")} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="hireDate">Hire date</FieldLabel>
            <Input id="hireDate" type="date" {...form.register("hireDate")} />
            <FieldError errors={[form.formState.errors.hireDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select
              value={form.watch("status")}
              onValueChange={(value) =>
                form.setValue("status", value as EmployeeFormValues["status"])
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="photoUrl">Photo URL</FieldLabel>
          <Input id="photoUrl" placeholder="https://..." {...form.register("photoUrl")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : employee ? "Save changes" : "Add employee"}
        </Button>
      </FieldGroup>
    </form>
  )
}
