"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Search } from "lucide-react"
import type { Product } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipTerm } from "@/components/tooltip-term"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/dateFormatdo"
import { formatCurrency } from "@/lib/numberRealFormatado"

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState<keyof Product>("id")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let result = [...products]

    // Filtro de busca
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de categoria
    if (categoryFilter !== "all") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "id") {
        const aId = Number(a.id)
        const bId = Number(b.id)
        if (!isNaN(aId) && !isNaN(bId)) {
          return sortOrder === "asc" ? aId - bId : bId - aId
        }
        return sortOrder === "asc" 
          ? a.id.toString().localeCompare(b.id.toString())
          : b.id.toString().localeCompare(a.id.toString())
      }
      return 0
    })

    setFilteredProducts(result)
  }, [searchTerm, categoryFilter, products, sortBy, sortOrder])

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

  function ProductTableSkeleton() {
    return (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-[85px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[40px] ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[120px] ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-[120px] ml-auto" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
          </TableRow>
        ))}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, SKU ou ID..."
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
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  if (sortBy === "id") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  } else {
                    setSortBy("id")
                    setSortOrder("asc")
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  ID
                  {sortBy === "id" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHead>
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
              <TableHead className="text-right">Data de Criação</TableHead>
              <TableHead className="text-right">Data de atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <ProductTableSkeleton />
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{getCategoryLabel(product.category)}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.sellingPrice)}</TableCell>
                  <TableCell className="text-right">
                    {calculateMargin(product.costPrice, product.sellingPrice).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">{formatDate(product.createdAt, "full")}</TableCell>
                  <TableCell className="text-right">{formatDate(product.updatedAt, "full")}</TableCell>
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