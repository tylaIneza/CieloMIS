import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/shared/page-header"
import { ProductsTable } from "@/features/products/components/products-table"
import type { ProductRow } from "@/features/products/components/columns"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } })

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    paymentRate: Number(p.paymentRate),
    isActive: p.isActive,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Tailoring products and their per-unit payment rates"
      />
      <ProductsTable data={rows} />
    </div>
  )
}
