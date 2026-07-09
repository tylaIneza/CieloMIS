import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
} from "date-fns"
import {
  Users,
  UserSquare2,
  ClipboardList,
  CalendarClock,
  Scissors,
  Wallet,
  HandCoins,
  Boxes,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { formatCurrency } from "@/lib/format"
import { RevenueExpenseChart, type MonthlyFinancials } from "@/features/dashboard/components/revenue-expense-chart"
import { ProductionChart, type WeeklyProduction } from "@/features/dashboard/components/production-chart"
import { RecentActivity } from "@/features/dashboard/components/recent-activity"
import { LowStockList } from "@/features/dashboard/components/low-stock-list"

export default async function DashboardPage() {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [
    totalEmployees,
    totalCustomers,
    activeOrders,
    ordersDueToday,
    todaysProduction,
    outstandingLoans,
    inventoryItems,
    todaysExpenses,
    monthlyRevenue,
    monthlyExpenses,
    monthlyPayroll,
    latestPayrollWeek,
    recentActivityRaw,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.customer.count(),
    prisma.order.count({ where: { status: { not: "DELIVERED" } } }),
    prisma.order.count({
      where: { dueDate: { gte: todayStart, lt: todayEnd }, status: { not: "DELIVERED" } },
    }),
    prisma.production.aggregate({
      _sum: { totalEarned: true },
      where: { date: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.loan.aggregate({ _sum: { balance: true }, where: { status: "ACTIVE" } }),
    prisma.inventoryItem.findMany({
      select: { id: true, name: true, unit: true, currentStock: true, minimumStock: true, purchasePrice: true },
    }),
    prisma.expense.aggregate({
      _sum: { totalCost: true },
      where: { date: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.customerPayment.aggregate({
      _sum: { amount: true },
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.expense.aggregate({
      _sum: { totalCost: true },
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.payroll.aggregate({
      _sum: { netSalary: true },
      where: { weekEnding: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.payroll.aggregate({ _max: { weekEnding: true } }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
      include: { user: true },
    }),
  ])

  const weeklyPayrollTotal = latestPayrollWeek._max.weekEnding
    ? await prisma.payroll.aggregate({
        _sum: { netSalary: true },
        where: { weekEnding: latestPayrollWeek._max.weekEnding },
      })
    : { _sum: { netSalary: 0 } }

  const lowStockItems = inventoryItems.filter(
    (i) => Number(i.currentStock) < Number(i.minimumStock)
  )
  const inventoryValue = inventoryItems.reduce(
    (sum, i) => sum + Number(i.currentStock) * Number(i.purchasePrice),
    0
  )

  const monthlyProfit =
    Number(monthlyRevenue._sum.amount ?? 0) -
    Number(monthlyExpenses._sum.totalCost ?? 0) -
    Number(monthlyPayroll._sum.netSalary ?? 0)

  // Last 6 months of revenue/expenses/payroll
  const monthlyFinancials: MonthlyFinancials[] = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const mStart = startOfMonth(monthDate)
    const mEnd = endOfMonth(monthDate)
    const [rev, exp, pay] = await Promise.all([
      prisma.customerPayment.aggregate({
        _sum: { amount: true },
        where: { date: { gte: mStart, lte: mEnd } },
      }),
      prisma.expense.aggregate({
        _sum: { totalCost: true },
        where: { date: { gte: mStart, lte: mEnd } },
      }),
      prisma.payroll.aggregate({
        _sum: { netSalary: true },
        where: { weekEnding: { gte: mStart, lte: mEnd } },
      }),
    ])
    monthlyFinancials.push({
      month: format(monthDate, "MMM"),
      revenue: Number(rev._sum.amount ?? 0),
      expenses: Number(exp._sum.totalCost ?? 0),
      payroll: Number(pay._sum.netSalary ?? 0),
    })
  }

  // Last 8 weeks of production units
  const weeklyProduction: WeeklyProduction[] = []
  for (let i = 7; i >= 0; i--) {
    const weekDate = subWeeks(now, i)
    const wStart = startOfWeek(weekDate, { weekStartsOn: 1 })
    const wEnd = endOfWeek(weekDate, { weekStartsOn: 1 })
    const sum = await prisma.production.aggregate({
      _sum: { quantity: true },
      where: { date: { gte: wStart, lte: wEnd } },
    })
    weeklyProduction.push({
      week: format(wStart, "d MMM"),
      units: sum._sum.quantity ?? 0,
    })
  }

  const recentActivity = recentActivityRaw.map((a) => ({
    id: a.id,
    action: a.action,
    entityType: a.entityType,
    userName: a.user?.name ?? null,
    timestamp: a.timestamp,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your boutique's operations" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Employees" value={String(totalEmployees)} icon={Users} />
        <StatCard label="Total Customers" value={String(totalCustomers)} icon={UserSquare2} />
        <StatCard label="Active Orders" value={String(activeOrders)} icon={ClipboardList} />
        <StatCard
          label="Orders Due Today"
          value={String(ordersDueToday)}
          icon={CalendarClock}
          tone={ordersDueToday > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Today's Production"
          value={formatCurrency(Number(todaysProduction._sum.totalEarned ?? 0))}
          icon={Scissors}
        />
        <StatCard
          label="This Week's Payroll"
          value={formatCurrency(Number(weeklyPayrollTotal._sum.netSalary ?? 0))}
          icon={Wallet}
        />
        <StatCard
          label="Outstanding Loans"
          value={formatCurrency(Number(outstandingLoans._sum.balance ?? 0))}
          icon={HandCoins}
          tone={Number(outstandingLoans._sum.balance ?? 0) > 0 ? "warning" : "default"}
        />
        <StatCard label="Inventory Value" value={formatCurrency(inventoryValue)} icon={Boxes} />
        <StatCard
          label="Today's Expenses"
          value={formatCurrency(Number(todaysExpenses._sum.totalCost ?? 0))}
          icon={Receipt}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(Number(monthlyRevenue._sum.amount ?? 0))}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Monthly Profit"
          value={formatCurrency(monthlyProfit)}
          icon={monthlyProfit >= 0 ? TrendingUp : TrendingDown}
          tone={monthlyProfit >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Low Stock Alerts"
          value={String(lowStockItems.length)}
          icon={AlertTriangle}
          tone={lowStockItems.length > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueExpenseChart data={monthlyFinancials} />
        <ProductionChart data={weeklyProduction} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity entries={recentActivity} />
        <LowStockList
          items={lowStockItems.map((i) => ({
            id: i.id,
            name: i.name,
            currentStock: Number(i.currentStock),
            minimumStock: Number(i.minimumStock),
            unit: i.unit,
          }))}
        />
      </div>
    </div>
  )
}
