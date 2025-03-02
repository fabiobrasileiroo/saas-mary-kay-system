"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { Product, Sale } from "./types"

// Simulação de banco de dados com armazenamento em memória
let products: Product[] = [
  {
    id: "1",
    name: "Batom Gel Semi-Matte",
    category: "makeup",
    description: "Batom de longa duração com acabamento semi-matte",
    costPrice: 25.5,
    sellingPrice: 59.9,
    stock: 15,
    sku: "MK-1001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "TimeWise 3D",
    category: "skincare",
    description: "Creme anti-idade para todos os tipos de pele",
    costPrice: 89.9,
    sellingPrice: 199.9,
    stock: 8,
    sku: "MK-2001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Base Líquida TimeWise",
    category: "makeup",
    description: "Base líquida de cobertura média a alta",
    costPrice: 45.5,
    sellingPrice: 99.9,
    stock: 12,
    sku: "MK-1002",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Perfume Thinking of You",
    category: "fragrance",
    description: "Fragrância floral com notas de jasmim e baunilha",
    costPrice: 65.0,
    sellingPrice: 149.9,
    stock: 10,
    sku: "MK-3001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const sales: Sale[] = [
  {
    id: "1",
    customerName: "Maria Silva",
    customerPhone: "(11) 98765-4321",
    paymentMethod: "credit",
    items: [
      {
        id: "1",
        productId: "1",
        quantity: 2,
        price: 59.9,
        productName: "Batom Gel Semi-Matte",
      },
      {
        id: "2",
        productId: "2",
        quantity: 1,
        price: 199.9,
        productName: "TimeWise 3D",
      },
    ],
    total: 319.7,
    profit: 144.8,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transportCost: 10,
    otherExpenses: 5,
    extraCosts: 0,
  },
  {
    id: "2",
    customerName: "Ana Oliveira",
    customerPhone: "(11) 91234-5678",
    paymentMethod: "pix",
    items: [
      {
        id: "1",
        productId: "3",
        quantity: 1,
        price: 99.9,
        productName: "Base Líquida TimeWise",
      },
    ],
    total: 99.9,
    profit: 54.4,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    transportCost: 0,
    otherExpenses: 0,
    extraCosts: 0,
  },
]

// Funções para gerenciar produtos
export async function getProducts(): Promise<Product[]> {
  return products
}

export async function getProduct(id: string): Promise<Product | null> {
  const product = products.find((p) => p.id === id)
  return product || null
}

export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const now = new Date().toISOString()
  const newProduct: Product = {
    id: uuidv4(),
    ...productData,
    createdAt: now,
    updatedAt: now,
  }

  products.push(newProduct)
  revalidatePath("/products")
  return newProduct
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
  const index = products.findIndex((p) => p.id === id)

  if (index === -1) {
    return null
  }

  const updatedProduct = {
    ...products[index],
    ...productData,
    updatedAt: new Date().toISOString(),
  }

  products[index] = updatedProduct
  revalidatePath("/products")
  return updatedProduct
}

export async function deleteProduct(id: string): Promise<boolean> {
  const initialLength = products.length
  products = products.filter((p) => p.id !== id)

  const deleted = initialLength > products.length
  if (deleted) {
    revalidatePath("/products")
  }

  return deleted
}

// Funções para gerenciar vendas
export async function getSales(): Promise<Sale[]> {
  return sales
}

export async function getSale(id: string): Promise<Sale | null> {
  const sale = sales.find((s) => s.id === id)
  return sale || null
}

export async function createSale(saleData: Omit<Sale, "id" | "profit" | "createdAt" | "updatedAt">): Promise<Sale> {
  const now = new Date().toISOString()

  // Calcular o lucro da venda
  let profit = 0
  for (const item of saleData.items) {
    const product = products.find((p) => p.id === item.productId)
    if (product) {
      // Atualizar o estoque
      product.stock -= item.quantity

      // Calcular o lucro deste item
      const itemProfit = (item.price - product.costPrice) * item.quantity
      profit += itemProfit
    }
  }

  // Subtrair os custos e despesas adicionais do lucro
  profit -= saleData.transportCost + saleData.extraCosts + saleData.otherExpenses

  const newSale: Sale = {
    id: uuidv4(),
    ...saleData,
    profit,
    createdAt: now,
    updatedAt: now,
  }

  sales.push(newSale)
  revalidatePath("/sales")
  return newSale
}

// Funções para relatórios e análises
export async function getSalesData() {
  // Aqui você deve implementar a lógica para calcular os dados reais de vendas
  // Esta é uma versão simplificada para demonstração
  const allSales = await getSales()

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

  const salesData = monthNames.map((month) => {
    const salesInMonth = allSales.filter((sale) => {
      const saleDate = new Date(sale.date)
      return saleDate.getMonth() === monthNames.indexOf(month)
    })

    const vendas = salesInMonth.reduce((sum, sale) => sum + sale.total, 0)
    const lucro = salesInMonth.reduce((sum, sale) => sum + (sale.profit || 0), 0)
    const custos_extras = salesInMonth.reduce((sum, sale) => sum + sale.extraCosts, 0)
    const outras_despesas = salesInMonth.reduce((sum, sale) => sum + sale.otherExpenses, 0)

    return {
      name: month,
      vendas,
      lucro,
      custos_extras,
      outras_despesas,
    }
  })

  return salesData
}

export async function getTopProducts() {
  // Simulação de dados para o gráfico de produtos mais vendidos
  return [
    { name: "Batom Gel Semi-Matte", value: 400 },
    { name: "TimeWise 3D", value: 300 },
    { name: "Base Líquida TimeWise", value: 300 },
    { name: "Máscara para Cílios", value: 200 },
    { name: "Perfume Thinking of You", value: 100 },
  ]
}

