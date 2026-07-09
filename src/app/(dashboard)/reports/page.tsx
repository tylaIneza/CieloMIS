import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { DateRangeFilter } from "@/features/reports/components/date-range-filter"
import { ReportView, type ReportData } from "@/features/reports/components/report-view"
import { resolveDateRange } from "@/features/reports/lib/date-range"
import { toDateInputValue } from "@/lib/format"

const presetLabels: Record<string, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  custom: "Custom Range",
}

interface ReportsPageProps {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams
  const range = resolveDateRange(params)

  const [
    revenueAgg,
    expenseAgg,
    payrollAgg,
    purchaseAgg,
    outstandingLoansAgg,
    inventoryItems,
    expenseByCategory,
    categories,
  ] = await Promise.all([
    prisma.customerPayment.aggregate({
      _sum: { amount: true },
      where: { date: { gte: range.from, lte: range.to } },
    }),
    prisma.expense.aggregate({
      _sum: { totalCost: true },
      where: { date: { gte: range.from, lte: range.to } },
    }),
    prisma.payroll.aggregate({
      _sum: { netSalary: true },
      where: { weekEnding: { gte: range.from, lte: range.to } },
    }),
    prisma.purchase.aggregate({
      _sum: { totalAmount: true },
      where: { date: { gte: range.from, lte: range.to } },
    }),
    prisma.loan.aggregate({ _sum: { balance: true }, where: { status: "ACTIVE" } }),
    prisma.inventoryItem.findMany({
      select: { currentStock: true, purchasePrice: true },
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      _sum: { totalCost: true },
      where: { date: { gte: range.from, lte: range.to } },
    }),
    prisma.expenseCategory.findMany(),
  ])

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const expensesByCategory = expenseByCategory
    .map((e) => ({
      category: categoryMap.get(e.categoryId) ?? "Unknown",
      total: Number(e._sum.totalCost ?? 0),
    }))
    .sort((a, b) => b.total - a.total)

  const inventoryValue = inventoryItems.reduce(
    (sum, i) => sum + Number(i.currentStock) * Number(i.purchasePrice),
    0
  )

  const revenue = Number(revenueAgg._sum.amount ?? 0)
  const expenses = Number(expenseAgg._sum.totalCost ?? 0)
  const payroll = Number(payrollAgg._sum.netSalary ?? 0)
  const purchases = Number(purchaseAgg._sum.totalAmount ?? 0)

  const data: ReportData = {
    rangeLabel: presetLabels[range.preset] ?? "Custom Range",
    rangeFrom: toDateInputValue(range.from),
    rangeTo: toDateInputValue(range.to),
    revenue,
    expenses,
    payroll,
    purchases,
    profit: revenue - expenses - payroll,
    cashFlow: revenue - expenses - payroll - purchases,
    outstandingLoans: Number(outstandingLoansAgg._sum.balance ?? 0),
    inventoryValue,
    expensesByCategory,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Financial performance across any date range"
      />
      <DateRangeFilter currentPreset={range.preset} from={range.from} to={range.to} />
      <ReportView data={data} />
    </div>
  )
}
