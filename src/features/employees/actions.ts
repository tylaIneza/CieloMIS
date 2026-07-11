"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity-log"
import { employeeSchema, type EmployeeFormValues } from "./schema"
import { EMPLOYEE_LINKED_RECORDS_MESSAGE } from "./constants"

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

export async function deleteEmployee(id: number, options?: { force?: boolean }) {
  if (!options?.force) {
    try {
      await prisma.employee.delete({ where: { id } })
    } catch {
      return { error: EMPLOYEE_LINKED_RECORDS_MESSAGE }
    }
  } else {
    await prisma.$transaction([
      prisma.order.updateMany({
        where: { assignedEmployeeId: id },
        data: { assignedEmployeeId: null },
      }),
      // Payroll must go first: it cascades away PayrollItem rows that
      // otherwise hold a required FK into Production, blocking its deletion.
      prisma.payroll.deleteMany({ where: { employeeId: id } }),
      prisma.production.deleteMany({ where: { employeeId: id } }),
      prisma.loan.deleteMany({ where: { employeeId: id } }),
      prisma.employee.delete({ where: { id } }),
    ])
  }
  await logActivity({ action: "DELETE", entityType: "Employee", entityId: id })
  revalidatePath("/employees")
}
