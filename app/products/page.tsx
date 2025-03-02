import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"

export default function ProductsPage() {
  return (
    <div className="container py-10">
      <BackButton href="/" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>
      <ProductsTable />
    </div>
  )
}

