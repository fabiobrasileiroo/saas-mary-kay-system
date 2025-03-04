"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash } from "lucide-react"
// import { ThemeToggle } from "@/components/theme-toggle"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSale } from "@/lib/actions"
import type { Product } from "@/lib/types"
import { getProducts } from "@/lib/actions"
import { TooltipTerm } from "@/components/tooltip-term"

export default function NewSalePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<Array<{
    productId: string
    quantity: number
    price: number
    productName: string
  }>>([])
  const [total, setTotal] = useState(0)
  const [transportCost, setTransportCost] = useState(0)
  const [extraCosts, setExtraCosts] = useState(0)
  const [otherExpenses, setOtherExpenses] = useState(0)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [items])

  function addItem() {
    setItems([...items, {
      productId: "",
      quantity: 1,
      price: 0,
      productName: ""
    }])
  }

  function removeItem(index: number) {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  function updateItem(index: number, field: string, value: string | number) {
    const newItems = [...items]

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value.toString(),
          price: product.sellingPrice,
          productName: product.name
        }
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      }
    }

    setItems(newItems)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      await createSale({
        
        customerName: formData.get("customerName") as string,
        customerPhone: formData.get("customerPhone") as string,
        paymentMethod: formData.get("paymentMethod") as string,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName
        })),
        total: total,
        transportCost: transportCost,
        extraCosts: extraCosts,
        otherExpenses: otherExpenses,
        date: new Date(),
      })

      router.push("/sales")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar venda:", error)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/sales">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Nova Venda</h1>
        </div>
        {/* <ThemeToggle /> */}
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Registrar Venda</CardTitle>
          <CardDescription>Adicione uma nova venda de produtos Mary Kay</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações do Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome do Cliente</Label>
                  <Input id="customerName" name="customerName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <Input id="customerPhone" name="customerPhone" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select name="paymentMethod" required defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transfer">Transferência Bancária</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Produtos</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>

              {items.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                </div>
              )}

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                  <div className="col-span-5 space-y-2">
                    <Label htmlFor={`product-${index}`}>Produto</Label>
                    <Select value={item.productId} onValueChange={(value) => updateItem(index, "productId", value)}>
                      <SelectTrigger id={`product-${index}`}>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - R$ {product.sellingPrice.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Qtd</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor={`price-${index}`}>Preço Unitário (R$)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", Number.parseFloat(e.target.value))}
                      readOnly
                    />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end text-lg font-medium pt-4">Subtotal: R$ {total.toFixed(2)}</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Custos e Despesas Adicionais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportCost">
                    <TooltipTerm term="Custo de Transporte">Custo de Transporte (R$)</TooltipTerm>
                  </Label>
                  <Input
                    id="transportCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number.parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraCosts">
                    <TooltipTerm term="Custos Extras">Custos Extras (R$)</TooltipTerm>
                  </Label>
                  <Input
                    id="extraCosts"
                    type="number"
                    step="0.01"
                    min="0"
                    value={extraCosts}
                    onChange={(e) => setExtraCosts(Number.parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherExpenses">
                    <TooltipTerm term="Outras Despesas">Outras Despesas (R$)</TooltipTerm>
                  </Label>
                  <Input
                    id="otherExpenses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(Number.parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end text-lg font-medium pt-4">
              Total da Venda: R$ {(total + transportCost + extraCosts + otherExpenses).toFixed(2)}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/sales">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || items.length === 0}>
                {isLoading ? "Salvando..." : "Finalizar Venda"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

