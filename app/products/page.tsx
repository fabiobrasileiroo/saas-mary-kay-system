"use client"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
// import { Product } from "@prisma/client"
import { Product } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackButton } from "@/components/back-button"
import { getProducts } from "@/lib/actions"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProducts();
        setProducts(
          data
        );
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      }
    };

    loadProduct();
  }, []);


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
      <ProductsTable products={products} />
    </div>
  )
}