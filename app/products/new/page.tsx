"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct } from "@/lib/actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipTerm } from "@/components/tooltip-term"

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      await createProduct({
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        costPrice: Number.parseFloat(formData.get("costPrice") as string),
        sellingPrice: Number.parseFloat(formData.get("sellingPrice") as string),
        stock: Number.parseInt(formData.get("stock") as string),
        sku: formData.get("sku") as string,
        userId: ''
      })

      router.push("/products")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar produto:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-md:px-2 max-lg:px-4 py-5 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Novo Produto</h1>
        </div>
        {/* <ThemeToggle /> */}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Cadastrar Produto</CardTitle>
          <CardDescription>Adicione um novo produto Mary Kay ao seu inventário</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" name="name" placeholder="Batom Gel Semi-Matte" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" required defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skincare">Cuidados com a Pele</SelectItem>
                    <SelectItem value="makeup">Maquiagem</SelectItem>
                    <SelectItem value="fragrance">Fragrâncias</SelectItem>
                    <SelectItem value="bodycare">Cuidados Corporais</SelectItem>
                    <SelectItem value="accessories">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" placeholder="Descrição detalhada do produto..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">
                  <TooltipTerm term="Preço de Custo">Preço de Custo (R$)</TooltipTerm>
                </Label>
                <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">
                  <TooltipTerm term="Preço de Venda">Preço de Venda (R$)</TooltipTerm>
                </Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">
                  <TooltipTerm term="Estoque">Quantidade em Estoque</TooltipTerm>
                </Label>
                <Input id="stock" name="stock" type="number" min="0" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">
                  <TooltipTerm term="SKU">Código SKU</TooltipTerm>
                </Label>
                <Input id="sku" name="sku" placeholder="MK-12345" required />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/products">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Produto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

