import Link from "next/link"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesChart } from "@/components/sales-chart"
import { RecentSales } from "@/components/recent-sales"
import { ProductsTable } from "@/components/products-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipTerm } from "@/components/tooltip-term"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
// import { usePathname } from "next/navigation";


export default async function Home() {
  //  const pathname = usePathname();
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-pink-500" />
            <h1 className="text-xl font-bold">Mary Kay Manager</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="ghost">Produtos</Button>
            </Link>
            <Link href="/sales">
              <Button variant="ghost">Vendas</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Relatórios</Button>
            </Link>
            <ThemeToggle />
            <UserButton showName />
          </nav>
        </div>
      </header>
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
                  <div className="text-2xl font-bold">R$ 15.231,89</div>
                  <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
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
                  <div className="text-2xl font-bold">R$ 6.092,75</div>
                  <p className="text-xs text-muted-foreground">+18.7% em relação ao mês anterior</p>
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
                  <div className="text-2xl font-bold">R$ 187,50</div>
                  <p className="text-xs text-muted-foreground">+5.2% em relação ao mês anterior</p>
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
                  <div className="text-2xl font-bold">243</div>
                  <p className="text-xs text-muted-foreground">+12 produtos adicionados este mês</p>
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
                      <SalesChart />
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Vendas Recentes</CardTitle>
                      <CardDescription>Você realizou 34 vendas este mês</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales />
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
                    <ProductsTable />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas Recentes</CardTitle>
                    <CardDescription>Histórico completo de vendas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales showAll />
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

