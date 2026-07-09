import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns"

export type ReportPreset = "today" | "week" | "month" | "year" | "custom"

interface ResolvedRange {
  preset: ReportPreset
  from: Date
  to: Date
}

export function resolveDateRange(searchParams: {
  preset?: string
  from?: string
  to?: string
}): ResolvedRange {
  const preset = (searchParams.preset as ReportPreset) || "month"
  const now = new Date()

  if (preset === "custom" && searchParams.from && searchParams.to) {
    return {
      preset,
      from: startOfDay(new Date(searchParams.from)),
      to: endOfDay(new Date(searchParams.to)),
    }
  }

  switch (preset) {
    case "today":
      return { preset, from: startOfDay(now), to: endOfDay(now) }
    case "week":
      return {
        preset,
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      }
    case "year":
      return { preset, from: startOfYear(now), to: endOfYear(now) }
    case "month":
    default:
      return { preset: "month", from: startOfMonth(now), to: endOfMonth(now) }
  }
}
