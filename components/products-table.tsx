"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Search } from "lucide-react"
import { Product } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipTerm } from "@/components/tooltip-term"

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Atualiza a lista filtrada quando os produtos ou filtros mudam
  useEffect(() => {
    let result = [...products]

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    setFilteredProducts(result)
  }, [searchTerm, categoryFilter, products])

  function getCategoryLabel(category: string) {
    const categories: Record<string, string> = {
      skincare: "Cuidados com a Pele",
      makeup: "Maquiagem",
      fragrance: "Fragrâncias",
      bodycare: "Cuidados Corporais",
      accessories: "Acessórios",
    }
    return categories[category] || category
  }

  function calculateMargin(costPrice: number, sellingPrice: number) {
    if (sellingPrice === 0) return 0
    return ((sellingPrice - costPrice) / sellingPrice) * 100
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="skincare">Cuidados com a Pele</SelectItem>
            <SelectItem value="makeup">Maquiagem</SelectItem>
            <SelectItem value="fragrance">Fragrâncias</SelectItem>
            <SelectItem value="bodycare">Cuidados Corporais</SelectItem>
            <SelectItem value="accessories">Acessórios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>
                <TooltipTerm term="Categoria">Categoria</TooltipTerm>
              </TableHead>
              <TableHead>
                <TooltipTerm term="SKU">SKU</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Preço de Custo">Preço de Custo</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Preço de Venda">Preço de Venda</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Margem de Lucro">Margem</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Estoque">Estoque</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryLabel(product.category)}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">
                    {product.costPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.sellingPrice.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {calculateMargin(product.costPrice, product.sellingPrice).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}