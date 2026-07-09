"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ReportPreset } from "@/features/reports/lib/date-range"
import { toDateInputValue } from "@/lib/format"

const presets: { value: ReportPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
]

export function DateRangeFilter({
  currentPreset,
  from,
  to,
}: {
  currentPreset: ReportPreset
  from: Date
  to: Date
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [customFrom, setCustomFrom] = useState(toDateInputValue(from))
  const [customTo, setCustomTo] = useState(toDateInputValue(to))

  function applyPreset(preset: ReportPreset) {
    router.push(`${pathname}?preset=${preset}`)
  }

  function applyCustom() {
    router.push(`${pathname}?preset=custom&from=${customFrom}&to=${customTo}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      {presets.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={currentPreset === p.value ? "default" : "outline"}
          onClick={() => applyPreset(p.value)}
        >
          {p.label}
        </Button>
      ))}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="w-36"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          className="w-36"
        />
        <Button
          size="sm"
          variant={currentPreset === "custom" ? "default" : "outline"}
          onClick={applyCustom}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}
