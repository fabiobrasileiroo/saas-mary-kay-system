"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { SalesChart } from "@/components/sales-chart"
import { ProductsChart } from "@/components/products-chart"
import { FinancialMetrics } from "@/components/financial-metrics"
import { TooltipTerm } from "@/components/tooltip-term"
import { BackButton } from "@/components/back-button"
import { exportToExcel } from "@/lib/excel-export"
import { getSales, getProducts, getFinancialMetrics } from "@/lib/actions"
import type { Sale, Product } from "@/lib/types"

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="h-[400px] flex items-center justify-center">
      <Skeleton className="h-full w-full" />
    </div>
  )
}

export default function ReportsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    netProfit: 0,
    totalExpenses: 0,
    averageTicket: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [salesData, productsData, metricsData] = await Promise.all([
          getSales(),
          getProducts(),
          getFinancialMetrics(),
        ])

        setSales(salesData)
        setProducts(productsData)
        setMetrics(metricsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, []) // Removed unnecessary dependency: date

  const handleExportReport = () => {
    const reportData = sales.map((sale) => ({
      Data: format(new Date(sale.date), "dd/MM/yyyy"),
      Cliente: sale.customerName,
      "Forma Pagamento": sale.paymentMethod,
      Total: sale.total,
      Transporte: sale.transportCost,
      "Custos Extras": sale.extraCosts,
      "Outras Despesas": sale.otherExpenses,
      Lucro: sale.profit,
    }))

    exportToExcel(reportData, `Relatorio_${format(date || new Date(), "yyyy-MM-dd")}`)
  }

  return (
    <div>
      <div className="container py-10">
        <BackButton href="/" />
        <div className="flex max-md:flex-col max-md:gap-4 items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <div className="flex max-sm:flex-col max-md:gap-2  items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM yyyy", { locale: ptBR }) : "Selecione um mês"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Button onClick={handleExportReport} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <TooltipTerm term="Fluxo de Caixa">Métricas Financeiras</TooltipTerm>
              </CardTitle>
              <CardDescription>Visão geral das métricas financeiras do período selecionado</CardDescription>
            </CardHeader>
            <CardContent>{isLoading ? <MetricsSkeleton /> : <FinancialMetrics metrics={metrics} />}</CardContent>
          </Card>

          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Vendas</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="profit">Lucratividade</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Período</CardTitle>
                  <CardDescription>Análise de vendas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {isLoading ? <ChartSkeleton /> : <SalesChart sales={sales} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Top produtos por volume de vendas</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {isLoading ? <ChartSkeleton /> : <ProductsChart products={products} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Lucratividade</CardTitle>
                  <CardDescription>Comparação entre receita bruta e lucro líquido</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {isLoading ? <ChartSkeleton /> : <SalesChart sales={sales} showProfit />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

