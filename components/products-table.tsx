"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProducts } from "@/lib/actions"
import type { Product } from "@/lib/types"
import { TooltipTerm } from "@/components/tooltip-term"

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    let result = products

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter) {
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
                  <TableCell className="text-right">R$ {product.costPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {product.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(0)}%
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

