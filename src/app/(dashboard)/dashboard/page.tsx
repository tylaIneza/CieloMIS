import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your boutique's operations"
      />
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Cielo MIS</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The full dashboard with live stats and charts will appear here.
        </CardContent>
      </Card>
    </div>
  )
}
