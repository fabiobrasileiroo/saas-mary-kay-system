import Link from "next/link"
import { DollarSign, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SalesChart } from "@/components/sales-chart"
import { RecentSales } from "@/components/recent-sales"
import { ProductsTable } from "@/components/products-table"
import { TooltipTerm } from "@/components/tooltip-term"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSales, getProducts } from "@/lib/actions"
import { Header } from "@/components/Header/header"
import { Suspense } from "react"

// Skeleton components
function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] flex items-center justify-center">
          <div className="space-y-2 w-full">
            <Skeleton className="h-[250px] w-full" />
            <div className="flex justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-12" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentSalesSkeleton() {
  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <Skeleton className="h-6 w-36 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="ml-auto">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsTableSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-24" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard content component
function DashboardContent({ sales, products }: { sales: any[]; products: any[] }) {
  // Cálculos principais
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0)
  const netProfit = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0)
  const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0
  const totalStock = products.reduce((acc, product) => acc + product.stock, 0)

  // Dados para gráfico de vendas
  const monthlySales = sales.reduce((acc: Record<string, number>, sale) => {
    const date = new Date(sale.date)
    const month = date.toLocaleString("pt-BR", { month: "2-digit", year: "numeric" })
    acc[month] = (acc[month] || 0) + sale.total
    return acc
  }, {})

  const chartData = Object.entries(monthlySales)
    .map(([month, total]) => ({
      month,
      total,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  // Vendas recentes (últimas 5)
  const recentSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <>
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
              {totalRevenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">{/* Cálculo de variação implementável aqui */}</p>
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
              {netProfit.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
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
              {averageTicket.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
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
                <SalesChart sales={sales} data={chartData} />
              </CardContent>
            </Card>
            <Card className="col-span-4 md:col-span-3 ">
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>{sales.length} vendas no total</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales sales={recentSales} showAll={false} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 max-xl:grid max-xl:grid-cols-1">
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
    </>
  )
}

// Dashboard skeleton component
function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="sales">Vendas Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <ChartSkeleton />
            <RecentSalesSkeleton />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 max-xl:grid max-xl:grid-cols-1">
          <ProductsTableSkeleton />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default async function Home() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  // Wrap data fetching in a try/catch to handle loading state
  let sales: any[] = []
  let products: any[] = []
  let isLoading = true

  try {
    // Fetch data in parallel
    const [salesData, productsData] = await Promise.all([getSales(), getProducts()])

    sales = salesData
    products = productsData
    isLoading = false
  } catch (error) {
    console.error("Error fetching data:", error)
    isLoading = false
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container max-md:px-2 max-lg:px-4 py-3 md:py-6">
          <div className="grid gap-6">
            <Suspense fallback={<DashboardSkeleton />}>
              {isLoading ? <DashboardSkeleton /> : <DashboardContent sales={sales} products={products} />}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

