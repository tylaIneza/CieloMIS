import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 max-w-sm" />
      <div className="space-y-2 rounded-lg border p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
