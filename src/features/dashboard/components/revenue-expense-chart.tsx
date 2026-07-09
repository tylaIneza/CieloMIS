"use client"

import { useTheme } from "next-themes"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartColors } from "@/features/dashboard/lib/chart-colors"
import { formatCurrency } from "@/lib/format"

export interface MonthlyFinancials {
  month: string
  revenue: number
  expenses: number
  payroll: number
}

export function RevenueExpenseChart({ data }: { data: MonthlyFinancials[] }) {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const revenue = chartColors.revenue[mode]
  const expenses = chartColors.expenses[mode]
  const payroll = chartColors.payroll[mode]
  const grid = chartColors.grid[mode]
  const axis = chartColors.axis[mode]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue, Expenses &amp; Payroll</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={grid} vertical={false} strokeWidth={1} />
            <XAxis
              dataKey="month"
              tick={{ fill: axis, fontSize: 12 }}
              axisLine={{ stroke: grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: axis, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${Math.round(value / 1000)}K`}
              width={40}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={revenue}
              strokeWidth={2}
              fill={revenue}
              fillOpacity={0.1}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={expenses}
              strokeWidth={2}
              fill={expenses}
              fillOpacity={0.1}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="payroll"
              name="Payroll"
              stroke={payroll}
              strokeWidth={2}
              fill={payroll}
              fillOpacity={0.1}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
