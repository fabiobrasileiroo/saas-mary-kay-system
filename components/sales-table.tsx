"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getSales } from "@/lib/actions"
import type { Sale } from "@/lib/types"
import { TooltipTerm } from "@/components/tooltip-term"
import { formatCurrency } from "@/lib/numberRealFormatado"

export function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSales() {
      setLoading(true)
      try {
        const data = await getSales()
        setSales(data)
        setFilteredSales(data)
      } catch (error) {
        console.error("Erro ao carregar vendas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  useEffect(() => {
    let result = sales

    if (searchTerm) {
      result = result.filter((sale) => sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (paymentFilter && paymentFilter !== "all") {
      result = result.filter((sale) => sale.paymentMethod === paymentFilter)
    }

    setFilteredSales(result)
  }, [searchTerm, paymentFilter, sales])

  function getPaymentMethodLabel(method: string) {
    const methods: Record<string, string> = {
      cash: "Dinheiro",
      credit: "Cartão de Crédito",
      debit: "Cartão de Débito",
      pix: "PIX",
      transfer: "Transferência Bancária",
    }
    return methods[method] || method
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Todas formas de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas formas de pagamento</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="credit">Cartão de Crédito</SelectItem>
            <SelectItem value="debit">Cartão de Débito</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="transfer">Transferência Bancária</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Valor Bruto">Total</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Custo de Transporte">Transporte</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Custos Extras">Custos Extras</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Outras Despesas">Outras Despesas</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">
                <TooltipTerm term="Lucro Líquido">Lucro</TooltipTerm>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 " />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell className="font-medium">{sale.customerName}</TableCell>
                  <TableCell>{getPaymentMethodLabel(sale.paymentMethod)}</TableCell>
                  <TableCell>{sale.items.length}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.transportCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.extraCosts)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.otherExpenses)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.profit || 0)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/sales/${sale.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Visualizar</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

