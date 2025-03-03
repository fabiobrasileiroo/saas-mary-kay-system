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
import { SalesChart } from "@/components/sales-chart"
import { ProductsChart } from "@/components/products-chart"
import { FinancialMetrics } from "@/components/financial-metrics"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipTerm } from "@/components/tooltip-term"
import { BackButton } from "@/components/back-button"
import { exportToExcel } from "@/lib/excel-export"
import { getSales, getProducts, getFinancialMetrics } from "@/lib/actions"
import type { Sale, Product } from "@/lib/types"

export default function ReportsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    netProfit: 0,
    totalExpenses: 0,
    averageTicket: 0
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [salesData, productsData, metricsData] = await Promise.all([
          getSales(),
          getProducts(),
          getFinancialMetrics()
        ])
        
        setSales(salesData)
        setProducts(productsData)
        setMetrics(metricsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }
    
    loadData()
  }, [date])

  const handleExportReport = () => {
    const reportData = sales.map(sale => ({
      Data: format(new Date(sale.date), "dd/MM/yyyy"),
      Cliente: sale.customerName,
      "Forma Pagamento": sale.paymentMethod,
      Total: sale.total,
      Transporte: sale.transportCost,
      "Custos Extras": sale.extraCosts,
      "Outras Despesas": sale.otherExpenses,
      Lucro: sale.profit
    }))

    exportToExcel(reportData, `Relatorio_${format(date || new Date(), "yyyy-MM-dd")}`)
  }

  return (
    <div className="container py-10">
      <BackButton href="/" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
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
          <Button onClick={handleExportReport}>
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
          <CardContent>
            <FinancialMetrics 
              // totalSales={metrics.totalSales}
              // netProfit={metrics.netProfit}
              // totalExpenses={metrics.totalExpenses}
              // averageTicket={metrics.averageTicket}
            />
          </CardContent>
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
                <SalesChart sales={sales} />
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
                <ProductsChart products={products} />
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
                <SalesChart sales={sales} showProfit />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}