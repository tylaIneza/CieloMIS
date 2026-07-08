import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import {
  PrismaClient,
  EmployeeStatus,
  OrderStatus,
  PayrollStatus,
  LoanStatus,
  LoanPaymentSource,
  InventoryCategory,
  StockMovementType,
  PaymentMethod,
  EquipmentCategory,
  EquipmentCondition,
  NotificationType,
} from "../src/generated/prisma/client"

const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ""),
})
const prisma = new PrismaClient({ adapter })

function daysAgo(days: number, base = new Date("2026-07-08")) {
  const d = new Date(base)
  d.setDate(d.getDate() - days)
  return d
}

async function main() {
  console.log("Seeding Cielo MIS database...")

  // ── Admin user ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Cielo@2026", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@cielo.rw" },
    update: {},
    create: {
      name: "Cielo Admin",
      email: "admin@cielo.rw",
      passwordHash,
      role: "ADMIN",
    },
  })

  // ── Settings ─────────────────────────────────────────────────────────
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "Cielo Fashion Boutique",
      phone: "+250 788 000 000",
      email: "info@cielo.rw",
      address: "KN 4 Ave, Kigali, Rwanda",
      currency: "RWF",
      payrollDeductionPercent: 30,
    },
  })

  // ── Expense categories ───────────────────────────────────────────────
  const categoryNames = [
    "Materials",
    "Equipment",
    "Utilities",
    "Rent",
    "Internet",
    "Electricity",
    "Water",
    "Transport",
    "Maintenance",
    "Marketing",
    "Cleaning",
    "Taxes",
    "Other",
  ]
  const categories: Record<string, number> = {}
  for (const name of categoryNames) {
    const cat = await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categories[name] = cat.id
  }

  // ── Employees ────────────────────────────────────────────────────────
  const diane = await prisma.employee.create({
    data: {
      name: "Uwase Diane",
      phone: "0788111001",
      address: "Kicukiro, Kigali",
      position: "Senior Tailor",
      hireDate: new Date("2023-02-01"),
      status: EmployeeStatus.ACTIVE,
      notes: "Specializes in women's suits.",
    },
  })
  const eric = await prisma.employee.create({
    data: {
      name: "Mugisha Eric",
      phone: "0788111002",
      address: "Nyamirambo, Kigali",
      position: "Tailor",
      hireDate: new Date("2023-08-15"),
      status: EmployeeStatus.ACTIVE,
      notes: "",
    },
  })
  const grace = await prisma.employee.create({
    data: {
      name: "Ingabire Grace",
      phone: "0788111003",
      address: "Remera, Kigali",
      position: "Cutter",
      hireDate: new Date("2024-04-10"),
      status: EmployeeStatus.ACTIVE,
      notes: "",
    },
  })

  // ── Products ─────────────────────────────────────────────────────────
  const productData = [
    { name: "Women's Pants", paymentRate: 5000 },
    { name: "Women's Suit", paymentRate: 8000 },
    { name: "Men's Shirt", paymentRate: 4000 },
    { name: "Men's Trousers", paymentRate: 4500 },
    { name: "Kids Dress", paymentRate: 3000 },
    { name: "School Uniform", paymentRate: 3500 },
  ]
  const products: Record<string, { id: number; paymentRate: number }> = {}
  for (const p of productData) {
    const created = await prisma.product.create({
      data: { name: p.name, paymentRate: p.paymentRate, isActive: true },
    })
    products[p.name] = { id: created.id, paymentRate: p.paymentRate }
  }
  const legacy = await prisma.product.create({
    data: { name: "Legacy Kitenge Wrap", paymentRate: 3000, isActive: false },
  })
  void legacy

  // ── Production + Payroll history (2 paid weeks + current unpaid week) ─
  type ProdPlan = { product: string; qtyPerDay: number }
  const plans: Record<number, ProdPlan> = {
    [diane.id]: { product: "Women's Pants", qtyPerDay: 2 },
    [eric.id]: { product: "Women's Suit", qtyPerDay: 1 },
    [grace.id]: { product: "Kids Dress", qtyPerDay: 3 },
  }

  async function seedWeek(weekEndingIso: string, employeeId: number, paid: boolean) {
    const weekEnding = new Date(weekEndingIso)
    const plan = plans[employeeId]
    const rate = products[plan.product].paymentRate
    const dailyTotal = plan.qtyPerDay * rate

    let payrollId: number | null = null
    let gross = 0
    const dayOffsets = paid ? [4, 3, 2, 1, 0] : [4, 3, 2] // Mon-Fri (paid week) or Mon-Wed so far (in-progress week)
    const productionRows: { date: Date }[] = []
    for (const offset of dayOffsets) {
      const date = new Date(weekEnding)
      date.setDate(date.getDate() - offset)
      productionRows.push({ date })
      gross += dailyTotal
    }

    if (paid) {
      const loan = await prisma.loan.findFirst({ where: { employeeId, status: LoanStatus.ACTIVE } })
      const deductionRate = 0.3
      const rawDeduction = Math.round(gross * deductionRate)
      const deduction = loan ? Math.min(rawDeduction, Number(loan.balance)) : 0
      const remainingLoan = loan ? Number(loan.balance) - deduction : 0
      const net = gross - deduction

      const payroll = await prisma.payroll.create({
        data: {
          employeeId,
          weekEnding,
          grossSalary: gross,
          loanDeduction: deduction,
          remainingLoan,
          netSalary: net,
          paymentDate: weekEnding,
          status: PayrollStatus.PAID,
        },
      })
      payrollId = payroll.id

      if (loan && deduction > 0) {
        await prisma.loanPayment.create({
          data: {
            loanId: loan.id,
            amount: deduction,
            source: LoanPaymentSource.PAYROLL_DEDUCTION,
            date: weekEnding,
          },
        })
        const newBalance = Number(loan.balance) - deduction
        await prisma.loan.update({
          where: { id: loan.id },
          data: {
            balance: newBalance,
            status: newBalance <= 0 ? LoanStatus.PAID : LoanStatus.ACTIVE,
          },
        })
        if (newBalance <= 0) {
          const employee = await prisma.employee.findUniqueOrThrow({ where: { id: employeeId } })
          await prisma.notification.create({
            data: {
              type: NotificationType.LOAN_PAID,
              title: "Loan fully repaid",
              message: `${employee.name}'s loan has been fully repaid.`,
              relatedEntityType: "Loan",
              relatedEntityId: loan.id,
            },
          })
        }
      }
    }

    for (const row of productionRows) {
      const production = await prisma.production.create({
        data: {
          date: row.date,
          employeeId,
          productId: products[plan.product].id,
          quantity: plan.qtyPerDay,
          rateSnapshot: rate,
          totalEarned: dailyTotal,
          payrollId,
        },
      })
      if (payrollId) {
        await prisma.payrollItem.create({
          data: { payrollId, productionId: production.id, amount: dailyTotal },
        })
      }
    }
  }

  // Loans: Eric has an active partial loan, Grace's loan gets fully paid off, Diane has none.
  const ericLoan = await prisma.loan.create({
    data: {
      employeeId: eric.id,
      amount: 30000,
      balance: 30000,
      status: LoanStatus.ACTIVE,
      issuedDate: new Date("2026-06-01"),
      notes: "Advance for family emergency.",
    },
  })
  const graceLoan = await prisma.loan.create({
    data: {
      employeeId: grace.id,
      amount: 20000,
      balance: 20000,
      status: LoanStatus.ACTIVE,
      issuedDate: new Date("2026-06-01"),
      notes: "Advance against salary.",
    },
  })
  void ericLoan
  void graceLoan

  for (const employeeId of [diane.id, eric.id, grace.id]) {
    await seedWeek("2026-06-26", employeeId, true)
    await seedWeek("2026-07-03", employeeId, true)
    await seedWeek("2026-07-10", employeeId, false) // current, in-progress week — left unpaid for live payroll demo
  }

  // ── Customers ────────────────────────────────────────────────────────
  const customerData = [
    { name: "Aline Uwamahoro", phone: "0788222001", email: "aline@example.com", address: "Kimironko, Kigali" },
    { name: "Jean Bosco Habimana", phone: "0788222002", email: "jbosco@example.com", address: "Gikondo, Kigali" },
    { name: "Marie Claire Ingabire", phone: "0788222003", email: "marieclaire@example.com", address: "Kacyiru, Kigali" },
    { name: "Eric Niyonsenga", phone: "0788222004", email: "eniyonsenga@example.com", address: "Nyarutarama, Kigali" },
    { name: "Solange Umutoni", phone: "0788222005", email: "solange@example.com", address: "Gisozi, Kigali" },
  ]
  const customers: Record<string, number> = {}
  for (const c of customerData) {
    const created = await prisma.customer.create({ data: c })
    customers[c.name] = created.id
  }

  // ── Suppliers ────────────────────────────────────────────────────────
  const supplierData = [
    { name: "Textile Rwanda Ltd", phone: "0788999000", address: "Nyabugogo, Kigali" },
    { name: "Kigali Notions & Trims", phone: "0788888000", address: "Muhima, Kigali" },
    { name: "Nyabugogo Hardware Supplies", phone: "0788777000", address: "Nyabugogo, Kigali" },
  ]
  const suppliers: Record<string, number> = {}
  for (const s of supplierData) {
    const created = await prisma.supplier.create({ data: s })
    suppliers[s.name] = created.id
  }

  // ── Orders (one per status, with an item, measurement and payment) ──
  const orderPlans = [
    {
      number: "ORD-2026-0001",
      customer: "Aline Uwamahoro",
      product: "Women's Suit",
      qty: 1,
      status: OrderStatus.PENDING,
      orderDate: "2026-07-05",
      dueDate: "2026-07-15",
      deposit: 3000,
      employee: diane.id,
    },
    {
      number: "ORD-2026-0002",
      customer: "Jean Bosco Habimana",
      product: "Men's Shirt",
      qty: 1,
      status: OrderStatus.CUTTING,
      orderDate: "2026-07-01",
      dueDate: "2026-07-08",
      deposit: 2000,
      employee: grace.id,
    },
    {
      number: "ORD-2026-0003",
      customer: "Marie Claire Ingabire",
      product: "Kids Dress",
      qty: 2,
      status: OrderStatus.SEWING,
      orderDate: "2026-06-28",
      dueDate: "2026-07-09",
      deposit: 6000,
      employee: grace.id,
    },
    {
      number: "ORD-2026-0004",
      customer: "Eric Niyonsenga",
      product: "Women's Pants",
      qty: 1,
      status: OrderStatus.IRONING,
      orderDate: "2026-06-20",
      dueDate: "2026-06-30",
      deposit: 2000,
      employee: diane.id,
    },
    {
      number: "ORD-2026-0005",
      customer: "Solange Umutoni",
      product: "Women's Suit",
      qty: 1,
      status: OrderStatus.FINISHED,
      orderDate: "2026-06-15",
      dueDate: "2026-06-25",
      deposit: 8000,
      employee: eric.id,
    },
    {
      number: "ORD-2026-0006",
      customer: "Aline Uwamahoro",
      product: "Men's Trousers",
      qty: 1,
      status: OrderStatus.DELIVERED,
      orderDate: "2026-06-01",
      dueDate: "2026-06-10",
      deposit: 4500,
      employee: eric.id,
    },
  ]

  for (const o of orderPlans) {
    const rate = products[o.product].paymentRate
    const totalPrice = rate * o.qty
    const remainingBalance = totalPrice - o.deposit
    const order = await prisma.order.create({
      data: {
        orderNumber: o.number,
        customerId: customers[o.customer],
        orderDate: new Date(o.orderDate),
        dueDate: new Date(o.dueDate),
        assignedEmployeeId: o.employee,
        fabric: "Customer-supplied Ankara",
        status: o.status,
        totalPrice,
        deposit: o.deposit,
        remainingBalance,
      },
    })
    const item = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: products[o.product].id,
        quantity: o.qty,
        unitPrice: rate,
        subtotal: totalPrice,
      },
    })
    await prisma.measurement.create({
      data: {
        orderItemId: item.id,
        chest: 92,
        waist: 76,
        hip: 98,
        shoulder: 40,
        sleeveLength: 58,
        length: 105,
        neck: 38,
      },
    })
    if (o.deposit > 0) {
      await prisma.customerPayment.create({
        data: {
          orderId: order.id,
          customerId: customers[o.customer],
          amount: o.deposit,
          paymentMethod: PaymentMethod.MOBILE_MONEY,
          date: new Date(o.orderDate),
          invoiceNumber: `INV-${o.number}`,
          recordedById: admin.id,
        },
      })
    }
    if (o.status === OrderStatus.CUTTING) {
      await prisma.notification.create({
        data: {
          type: NotificationType.ORDER_DUE,
          title: "Order due today",
          message: `Order ${o.number} for ${o.customer} is due today.`,
          relatedEntityType: "Order",
          relatedEntityId: order.id,
        },
      })
    }
  }

  // ── Inventory ────────────────────────────────────────────────────────
  const inventoryData = [
    { name: "Cotton Fabric (Ankara)", category: InventoryCategory.FABRIC, unit: "meters", purchasePrice: 3500, minimumStock: 20, currentStock: 15, location: "Shelf A1", supplier: "Textile Rwanda Ltd" },
    { name: "Polyester Lining", category: InventoryCategory.LINING, unit: "meters", purchasePrice: 1500, minimumStock: 15, currentStock: 40, location: "Shelf A2", supplier: "Textile Rwanda Ltd" },
    { name: "Sewing Thread (Black)", category: InventoryCategory.THREAD, unit: "spools", purchasePrice: 500, minimumStock: 30, currentStock: 10, location: "Shelf B1", supplier: "Kigali Notions & Trims" },
    { name: "Sewing Thread (White)", category: InventoryCategory.THREAD, unit: "spools", purchasePrice: 500, minimumStock: 30, currentStock: 45, location: "Shelf B1", supplier: "Kigali Notions & Trims" },
    { name: "Plastic Buttons (Assorted)", category: InventoryCategory.BUTTONS, unit: "pieces", purchasePrice: 50, minimumStock: 200, currentStock: 500, location: "Shelf B2", supplier: "Kigali Notions & Trims" },
    { name: "Metal Zippers 20cm", category: InventoryCategory.ZIPPERS, unit: "pieces", purchasePrice: 300, minimumStock: 50, currentStock: 20, location: "Shelf B3", supplier: "Kigali Notions & Trims" },
    { name: "Elastic Band", category: InventoryCategory.ELASTIC, unit: "meters", purchasePrice: 400, minimumStock: 25, currentStock: 60, location: "Shelf B4", supplier: "Kigali Notions & Trims" },
    { name: "Sewing Machine Needles", category: InventoryCategory.NEEDLES, unit: "packs", purchasePrice: 1200, minimumStock: 10, currentStock: 8, location: "Shelf C1", supplier: "Nyabugogo Hardware Supplies" },
    { name: "Brand Labels (Cielo)", category: InventoryCategory.LABELS, unit: "pieces", purchasePrice: 100, minimumStock: 100, currentStock: 300, location: "Shelf C2", supplier: null },
    { name: "Packaging Bags", category: InventoryCategory.PACKAGING, unit: "pieces", purchasePrice: 200, minimumStock: 100, currentStock: 250, location: "Shelf C3", supplier: null },
  ]
  const inventoryItems: Record<string, number> = {}
  for (const item of inventoryData) {
    const created = await prisma.inventoryItem.create({
      data: {
        name: item.name,
        category: item.category,
        unit: item.unit,
        purchasePrice: item.purchasePrice,
        minimumStock: item.minimumStock,
        currentStock: item.currentStock,
        location: item.location,
        supplierId: item.supplier ? suppliers[item.supplier] : null,
      },
    })
    inventoryItems[item.name] = created.id
    if (Number(item.currentStock) < item.minimumStock) {
      await prisma.notification.create({
        data: {
          type: NotificationType.LOW_STOCK,
          title: "Low stock alert",
          message: `${item.name} is below minimum stock (${item.currentStock}/${item.minimumStock} ${item.unit}).`,
          relatedEntityType: "InventoryItem",
          relatedEntityId: created.id,
        },
      })
    }
  }

  // ── Purchases (historical record) ───────────────────────────────────
  const purchase1 = await prisma.purchase.create({
    data: {
      supplierId: suppliers["Textile Rwanda Ltd"],
      date: new Date("2026-06-20"),
      invoiceNumber: "INV-2026-101",
      totalAmount: 50 * 3500 + 30 * 1500,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      recordedById: admin.id,
    },
  })
  const purchase1Items = [
    { item: "Cotton Fabric (Ankara)", qty: 50, price: 3500 },
    { item: "Polyester Lining", qty: 30, price: 1500 },
  ]
  for (const pi of purchase1Items) {
    await prisma.purchaseItem.create({
      data: {
        purchaseId: purchase1.id,
        inventoryItemId: inventoryItems[pi.item],
        quantity: pi.qty,
        unitPrice: pi.price,
        total: pi.qty * pi.price,
      },
    })
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: inventoryItems[pi.item],
        type: StockMovementType.IN,
        quantity: pi.qty,
        reason: "Purchase INV-2026-101",
        purchaseId: purchase1.id,
        date: new Date("2026-06-20"),
        recordedById: admin.id,
      },
    })
  }

  const purchase2 = await prisma.purchase.create({
    data: {
      supplierId: suppliers["Kigali Notions & Trims"],
      date: new Date("2026-07-01"),
      invoiceNumber: "INV-2026-205",
      totalAmount: 100 * 300 + 300 * 50,
      paymentMethod: PaymentMethod.CASH,
      recordedById: admin.id,
    },
  })
  const purchase2Items = [
    { item: "Metal Zippers 20cm", qty: 100, price: 300 },
    { item: "Plastic Buttons (Assorted)", qty: 300, price: 50 },
  ]
  for (const pi of purchase2Items) {
    await prisma.purchaseItem.create({
      data: {
        purchaseId: purchase2.id,
        inventoryItemId: inventoryItems[pi.item],
        quantity: pi.qty,
        unitPrice: pi.price,
        total: pi.qty * pi.price,
      },
    })
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: inventoryItems[pi.item],
        type: StockMovementType.IN,
        quantity: pi.qty,
        reason: "Purchase INV-2026-205",
        purchaseId: purchase2.id,
        date: new Date("2026-07-01"),
        recordedById: admin.id,
      },
    })
  }

  // ── Expenses (one per category) ─────────────────────────────────────
  const expenseData = [
    { category: "Materials", item: "Zippers restock", unitPrice: 15000, date: "2026-07-02" },
    { category: "Equipment", item: "Overlock machine belt", unitPrice: 8000, date: "2026-06-25" },
    { category: "Utilities", item: "Monthly utility bill", unitPrice: 45000, date: "2026-07-01" },
    { category: "Rent", item: "Boutique rent - July", unitPrice: 250000, date: "2026-07-01" },
    { category: "Internet", item: "Internet subscription", unitPrice: 25000, date: "2026-07-01" },
    { category: "Electricity", item: "EUCL prepaid tokens", unitPrice: 30000, date: "2026-07-03" },
    { category: "Water", item: "WASAC monthly bill", unitPrice: 12000, date: "2026-07-03" },
    { category: "Transport", item: "Fabric delivery transport", unitPrice: 5000, date: "2026-06-28" },
    { category: "Maintenance", item: "Sewing machine servicing", unitPrice: 15000, date: "2026-05-01" },
    { category: "Marketing", item: "Instagram ad boost", unitPrice: 20000, date: "2026-06-15" },
    { category: "Cleaning", item: "Cleaning supplies", unitPrice: 6000, date: "2026-07-04" },
    { category: "Taxes", item: "Quarterly trading license", unitPrice: 60000, date: "2026-06-10" },
    { category: "Other", item: "Miscellaneous shop supplies", unitPrice: 4000, date: "2026-07-05" },
  ]
  for (const e of expenseData) {
    await prisma.expense.create({
      data: {
        date: new Date(e.date),
        categoryId: categories[e.category],
        item: e.item,
        quantity: 1,
        unitPrice: e.unitPrice,
        totalCost: e.unitPrice,
        paymentMethod: PaymentMethod.CASH,
        recordedById: admin.id,
      },
    })
  }

  // ── Equipment ────────────────────────────────────────────────────────
  const machine = await prisma.equipment.create({
    data: {
      name: "Industrial Sewing Machine",
      category: EquipmentCategory.SEWING_MACHINE,
      brand: "Juki",
      model: "DDL-8700",
      serialNumber: "JK-2201",
      purchaseDate: new Date("2024-03-10"),
      purchasePrice: 450000,
      warrantyExpiry: new Date("2026-09-10"),
      supplierId: suppliers["Nyabugogo Hardware Supplies"],
      condition: EquipmentCondition.GOOD,
    },
  })
  await prisma.equipmentMaintenance.create({
    data: {
      equipmentId: machine.id,
      date: new Date("2026-05-01"),
      description: "Routine servicing and oil change",
      cost: 15000,
      performedBy: "Local Technician",
      nextMaintenanceDate: new Date("2026-11-01"),
    },
  })
  await prisma.equipment.create({
    data: {
      name: "Overlock Machine",
      category: EquipmentCategory.OVERLOCK_MACHINE,
      brand: "Brother",
      model: "3034D",
      purchaseDate: new Date("2023-08-15"),
      purchasePrice: 280000,
      supplierId: suppliers["Nyabugogo Hardware Supplies"],
      condition: EquipmentCondition.FAIR,
    },
  })
  await prisma.equipment.create({
    data: {
      name: "Steam Iron",
      category: EquipmentCategory.STEAM_IRON,
      brand: "Philips",
      model: "GC160",
      purchaseDate: new Date("2025-01-20"),
      purchasePrice: 60000,
      supplierId: suppliers["Nyabugogo Hardware Supplies"],
      condition: EquipmentCondition.EXCELLENT,
    },
  })

  // ── Activity log sample ──────────────────────────────────────────────
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      entityType: "System",
      newValue: { note: "Database seeded with demo data" },
    },
  })

  console.log("Seed complete.")
  console.log("Admin login -> email: admin@cielo.rw / password: Cielo@2026")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
