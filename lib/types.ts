export interface SaleItem {
  id: string
  productId: string
  quantity: number
  price: number
  productName: string
  saleId: string
  userId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Sale {
  id: string
  customerName: string
  customerPhone?: string | null
  paymentMethod: string
  items: SaleItem[]
  total: number
  transportCost: number
  extraCosts: number
  otherExpenses: number
  profit?: number | null
  date: string
  userId?: string | null
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
  sku?: string | null
  userId?: string | null
  createdAt?: string
  updatedAt?: string
}