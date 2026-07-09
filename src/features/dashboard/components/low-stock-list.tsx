import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export interface LowStockEntry {
  id: number
  name: string
  currentStock: number
  minimumStock: number
  unit: string
}

export function LowStockList({ items }: { items: LowStockEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All inventory items are well stocked.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                  {item.currentStock}/{item.minimumStock} {item.unit}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/inventory"
          className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
        >
          View inventory
        </Link>
      </CardContent>
    </Card>
  )
}
