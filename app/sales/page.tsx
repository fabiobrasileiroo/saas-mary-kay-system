import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SalesTable } from "@/components/sales-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { Header } from "@/components/Header/header"

export default function SalesPage() {
  return (
    <div>
      {/* <Header /> */}
      <div className="container py-10">
        <BackButton href="/" />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Vendas</h1>
          <div className="flex items-center gap-2">
            {/* <ThemeToggle /> */}
            <Link href="/sales/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Venda
              </Button>
            </Link>
          </div>
        </div>
        <SalesTable />
      </div>
    </div>
  )
}

