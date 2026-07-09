"use client"

import { FileDown, FileSpreadsheet, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { formatCurrency } from "@/lib/format"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  Boxes,
  ShoppingCart,
  Scale,
} from "lucide-react"

export interface ReportData {
  rangeLabel: string
  rangeFrom: string
  rangeTo: string
  revenue: number
  expenses: number
  payroll: number
  purchases: number
  profit: number
  cashFlow: number
  outstandingLoans: number
  inventoryValue: number
  expensesByCategory: { category: string; total: number }[]
}

export function ReportView({ data }: { data: ReportData }) {
  async function exportPdf() {
    const { jsPDF } = await import("jspdf")
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Cielo Fashion Boutique — Financial Report", 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Period: ${data.rangeLabel} (${data.rangeFrom} to ${data.rangeTo})`, 14, 25)

    autoTable(doc, {
      startY: 32,
      head: [["Metric", "Amount (RWF)"]],
      body: [
        ["Revenue", formatCurrency(data.revenue)],
        ["Expenses", formatCurrency(data.expenses)],
        ["Payroll", formatCurrency(data.payroll)],
        ["Purchases", formatCurrency(data.purchases)],
        ["Profit & Loss", formatCurrency(data.profit)],
        ["Cash Flow", formatCurrency(data.cashFlow)],
        ["Outstanding Loans", formatCurrency(data.outstandingLoans)],
        ["Inventory Value", formatCurrency(data.inventoryValue)],
      ],
    })

    const afterFirstTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

    autoTable(doc, {
      startY: afterFirstTable + 10,
      head: [["Expense Category", "Amount (RWF)"]],
      body: data.expensesByCategory.map((c) => [c.category, formatCurrency(c.total)]),
    })

    doc.save(`cielo-report-${data.rangeFrom}-to-${data.rangeTo}.pdf`)
  }

  async function exportExcel() {
    const ExcelJS = (await import("exceljs")).default
    const workbook = new ExcelJS.Workbook()
    const summarySheet = workbook.addWorksheet("Summary")
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 24 },
      { header: "Amount (RWF)", key: "amount", width: 18 },
    ]
    summarySheet.addRows([
      { metric: "Revenue", amount: data.revenue },
      { metric: "Expenses", amount: data.expenses },
      { metric: "Payroll", amount: data.payroll },
      { metric: "Purchases", amount: data.purchases },
      { metric: "Profit & Loss", amount: data.profit },
      { metric: "Cash Flow", amount: data.cashFlow },
      { metric: "Outstanding Loans", amount: data.outstandingLoans },
      { metric: "Inventory Value", amount: data.inventoryValue },
    ])

    const categorySheet = workbook.addWorksheet("Expenses by Category")
    categorySheet.columns = [
      { header: "Category", key: "category", width: 24 },
      { header: "Amount (RWF)", key: "amount", width: 18 },
    ]
    categorySheet.addRows(data.expensesByCategory.map((c) => ({ category: c.category, amount: c.total })))

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cielo-report-${data.rangeFrom}-to-${data.rangeTo}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{data.rangeLabel}</span> (
          {data.rangeFrom} to {data.rangeTo})
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf}>
            <FileDown className="size-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="size-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(data.revenue)} icon={TrendingUp} tone="success" />
        <StatCard label="Expenses" value={formatCurrency(data.expenses)} icon={TrendingDown} tone="danger" />
        <StatCard label="Payroll" value={formatCurrency(data.payroll)} icon={Wallet} />
        <StatCard label="Purchases" value={formatCurrency(data.purchases)} icon={ShoppingCart} />
        <StatCard
          label="Profit & Loss"
          value={formatCurrency(data.profit)}
          icon={Scale}
          tone={data.profit >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Cash Flow"
          value={formatCurrency(data.cashFlow)}
          icon={data.cashFlow >= 0 ? TrendingUp : TrendingDown}
          tone={data.cashFlow >= 0 ? "success" : "danger"}
        />
        <StatCard label="Outstanding Loans" value={formatCurrency(data.outstandingLoans)} icon={HandCoins} />
        <StatCard label="Inventory Value" value={formatCurrency(data.inventoryValue)} icon={Boxes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {data.expensesByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses in this period.</p>
          ) : (
            <div className="divide-y">
              {data.expensesByCategory.map((c) => (
                <div key={c.category} className="flex items-center justify-between py-2 text-sm">
                  <span>{c.category}</span>
                  <span className="font-medium">{formatCurrency(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
