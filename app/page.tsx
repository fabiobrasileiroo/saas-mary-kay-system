import Link from "next/link"
import { DollarSign, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesChart } from "@/components/sales-chart"
import { RecentSales } from "@/components/recent-sales"
import { ProductsTable } from "@/components/products-table"
import { TooltipTerm } from "@/components/tooltip-term"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSales, getProducts } from "@/lib/actions"
import {Header} from '@/components/Header/header'

export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const sales = await getSales()
  const products = await getProducts()

  // Cálculos principais
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0)
  const netProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0)
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0)

  // Dados para gráfico de vendas
  const monthlySales = sales.reduce((acc: Record<string, number>, sale) => {
    const date = new Date(sale.date)
    const month = date.toLocaleString('pt-BR', { month: '2-digit', year: 'numeric' })
    acc[month] = (acc[month] || 0) + sale.total
    return acc
  }, {})

  const chartData = Object.entries(monthlySales).map(([month, total]) => ({
    month,
    total
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  // Vendas recentes (últimas 5)
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col">
      <Header/>
      
     
      <main className="flex-1">
        <div className="container py-6">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <TooltipTerm term="Receita Bruta">Receita Total</TooltipTerm>
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalRevenue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {/* Cálculo de variação implementável aqui */}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <TooltipTerm term="Lucro Líquido">Lucro Líquido</TooltipTerm>
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {netProfit.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <TooltipTerm term="Ticket Médio">Ticket Médio</TooltipTerm>
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averageTicket.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <TooltipTerm term="Estoque">Produtos em Estoque</TooltipTerm>
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStock}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="sales">Vendas Recentes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Vendas Mensais</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      {/* {chartData} */}
                      <SalesChart  sales={sales} data={chartData} />
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Vendas Recentes</CardTitle>
                      <CardDescription>
                        {sales.length} vendas no total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales sales={recentSales}  showAll={false}/>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Produtos</CardTitle>
                    <Link href="/products/new">
                      <Button>Adicionar Produto</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <ProductsTable products={products} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                    <CardDescription>Todas as vendas registradas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales sales={sales} showAll />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}