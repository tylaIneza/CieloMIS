const currencyFormatter = new Intl.NumberFormat("en-RW", {
  style: "currency",
  currency: "RWF",
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value))
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function toDateInputValue(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toISOString().slice(0, 10)
}
