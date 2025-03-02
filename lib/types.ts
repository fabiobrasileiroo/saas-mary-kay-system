export interface SaleItem {
  id: string
  productId: string
  quantity: number
  price: number
  productName: string
}

export interface Sale {
  id: string
  customerName: string
  customerPhone?: string
  paymentMethod: string
  items: SaleItem[]
  total: number
  transportCost: number
  extraCosts: number // Novo campo para custos extras (ex: combustível)
  otherExpenses: number
  profit?: number
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  costPrice: number
  sellingPrice: number
  stock: number
  sku: string
  createdAt?: string
  updatedAt?: string
}

