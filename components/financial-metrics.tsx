"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipTerm } from "@/components/tooltip-term"
import { useEffect, useState } from "react"
import { getSales, getProducts } from "@/lib/actions"
import type { Sale, Product } from "@/lib/types"

interface SalesMetrics {
  totalRevenue: number
  grossProfit: number
  netProfit: number
  profitMargin: number
  averageTicket: number
  totalSales: number
  productCosts: number
  transportCosts: number
  extraCosts: number
  otherExpenses: number
}

const defaultMetrics: SalesMetrics = {
  totalRevenue: 0,
  grossProfit: 0,
  netProfit: 0,
  profitMargin: 0,
  averageTicket: 0,
  totalSales: 0,
  productCosts: 0,
  transportCosts: 0,
  extraCosts: 0,
  otherExpenses: 0,
}

export function FinancialMetrics() {
  const [salesData, setSalesData] = useState<{
    month: SalesMetrics
    quarter: SalesMetrics
    year: SalesMetrics
  }>({
    month: { ...defaultMetrics },
    quarter: { ...defaultMetrics },
    year: { ...defaultMetrics },
  })

  useEffect(() => {
    async function loadSalesData() {
      const sales = await getSales()
      const productsData = await getProducts()
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      const yearStart = new Date(now.getFullYear(), 0, 1)

      const monthData = calculateMetrics(sales, monthStart, productsData)
      const quarterData = calculateMetrics(sales, quarterStart, productsData)
      const yearData = calculateMetrics(sales, yearStart, productsData)

      setSalesData({
        month: monthData,
        quarter: quarterData,
        year: yearData,
      })
    }

    loadSalesData()
  }, [])

  return (
    <Tabs defaultValue="month">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="month">Mês Atual</TabsTrigger>
          <TabsTrigger value="quarter">Trimestre</TabsTrigger>
          <TabsTrigger value="year">Ano</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="month" className="space-y-4">
        <MetricsGrid data={salesData.month} />
      </TabsContent>

      <TabsContent value="quarter" className="space-y-4">
        <MetricsGrid data={salesData.quarter} />
      </TabsContent>

      <TabsContent value="year" className="space-y-4">
        <MetricsGrid data={salesData.year} />
      </TabsContent>
    </Tabs>
  )
}

function calculateMetrics(sales: Sale[], startDate: Date, products: Product[]): SalesMetrics {
  const filteredSales = sales.filter((sale) => new Date(sale.date) >= startDate)

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = filteredSales.length
  const productCosts = filteredSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce((itemSum, item) => {
        const product = products.find((p) => p.id === item.productId)
        return itemSum + (product ? product.costPrice * item.quantity : 0)
      }, 0),
    0,
  )
  const transportCosts = filteredSales.reduce((sum, sale) => sum + sale.transportCost, 0)
  const extraCosts = filteredSales.reduce((sum, sale) => sum + sale.extraCosts, 0)
  const otherExpenses = filteredSales.reduce((sum, sale) => sum + sale.otherExpenses, 0)

  const grossProfit = totalRevenue - productCosts
  const netProfit = grossProfit - transportCosts - extraCosts - otherExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  return {
    totalRevenue,
    grossProfit,
    netProfit,
    profitMargin,
    averageTicket,
    totalSales,
    productCosts,
    transportCosts,
    extraCosts,
    otherExpenses,
  }
}

interface MetricsGridProps {
  data: SalesMetrics
}

function MetricsGrid({ data }: MetricsGridProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={<TooltipTerm term="Receita Bruta">Receita Bruta</TooltipTerm>}
          value={`R$ ${data.totalRevenue.toFixed(2)}`}
        />
        <MetricCard
          title={<TooltipTerm term="Lucro Bruto">Lucro Bruto</TooltipTerm>}
          value={`R$ ${data.grossProfit.toFixed(2)}`}
        />
        <MetricCard
          title={<TooltipTerm term="Lucro Líquido">Lucro Líquido</TooltipTerm>}
          value={`R$ ${data.netProfit.toFixed(2)}`}
        />
        <MetricCard
          title={<TooltipTerm term="Margem de Lucro">Margem de Lucro</TooltipTerm>}
          value={`${data.profitMargin.toFixed(2)}%`}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={<TooltipTerm term="Ticket Médio">Ticket Médio</TooltipTerm>}
          value={`R$ ${data.averageTicket.toFixed(2)}`}
        />
        <MetricCard title="Total de Vendas" value={data.totalSales.toString()} />
        <MetricCard
          title={<TooltipTerm term="Custo de Produtos">Custo de Produtos</TooltipTerm>}
          value={`R$ ${data.productCosts.toFixed(2)}`}
        />
        <MetricCard
          title={<TooltipTerm term="Custo de Transporte">Custo de Transporte</TooltipTerm>}
          value={`R$ ${data.transportCosts.toFixed(2)}`}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={<TooltipTerm term="Custos Extras">Custos Extras</TooltipTerm>}
          value={`R$ ${data.extraCosts.toFixed(2)}`}
        />
        <MetricCard
          title={<TooltipTerm term="Outras Despesas">Outras Despesas</TooltipTerm>}
          value={`R$ ${data.otherExpenses.toFixed(2)}`}
        />
      </div>
    </>
  )
}

interface MetricCardProps {
  title: React.ReactNode
  value: string
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

