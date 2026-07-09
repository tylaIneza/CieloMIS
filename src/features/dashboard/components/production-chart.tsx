"use client"

import { useTheme } from "next-themes"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartColors } from "@/features/dashboard/lib/chart-colors"

export interface WeeklyProduction {
  week: string
  units: number
}

export function ProductionChart({ data }: { data: WeeklyProduction[] }) {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === "dark" ? "dark" : "light"
  const production = chartColors.production[mode]
  const grid = chartColors.grid[mode]
  const axis = chartColors.axis[mode]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Production (units)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={grid} vertical={false} strokeWidth={1} />
            <XAxis
              dataKey="week"
              tick={{ fill: axis, fontSize: 12 }}
              axisLine={{ stroke: grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: axis, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [`${value} units`, "Produced"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar
              dataKey="units"
              fill={production}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
