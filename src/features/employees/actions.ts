"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { employeeSchema, type EmployeeFormValues } from "./schema"

function toEmployeeData(data: EmployeeFormValues) {
  return {
    name: data.name,
    phone: data.phone,
    address: data.address || null,
    position: data.position,
    hireDate: new Date(data.hireDate),
    status: data.status,
    photoUrl: data.photoUrl || null,
    notes: data.notes || null,
  }
}

export async function createEmployee(values: EmployeeFormValues) {
  const data = employeeSchema.parse(values)
  const employee = await prisma.employee.create({ data: toEmployeeData(data) })
  await logActivity({
    action: "CREATE",
    entityType: "Employee",
    entityId: employee.id,
    newValue: data,
  })
  revalidatePath("/employees")
  return employee
}

export async function updateEmployee(id: number, values: EmployeeFormValues) {
  const data = employeeSchema.parse(values)
  const employee = await prisma.employee.update({
    where: { id },
    data: toEmployeeData(data),
  })
  await logActivity({
    action: "UPDATE",
    entityType: "Employee",
    entityId: id,
    newValue: data,
  })
  revalidatePath("/employees")
  return employee
}

export async function deleteEmployee(id: number) {
  try {
    await prisma.employee.delete({ where: { id } })
  } catch {
    throw new Error(
      "This employee has linked orders, production, payroll, or loan records and can't be deleted. Set their status to Inactive instead."
    )
  }
  await logActivity({ action: "DELETE", entityType: "Employee", entityId: id })
  revalidatePath("/employees")
}
