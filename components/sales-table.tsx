"use client"

import { TableHeader } from "@/components/ui/table"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSales } from "@/lib/actions"
import type { Sale } from "@/lib/types"
import { TooltipTerm } from "@/components/tooltip-term"

export function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")

  useEffect(() => {
    async function loadSales() {
      try {
        const data = await getSales()
        setSales(data)
        setFilteredSales(data)
      } catch (error) {
        console.error("Erro ao carregar vendas:", error)
      }
    }

    loadSales()
  }, [])

  useEffect(() => {
    let result = sales

    if (searchTerm) {
      result = result.filter((sale) => sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (paymentFilter) {
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
            {filteredSales.length === 0 ? (
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
                  <TableCell>{sale.items.length} itens</TableCell>
                  <TableCell className="text-right">R$ {sale.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {sale.transportCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {sale.extraCosts.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {sale.otherExpenses.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {(sale.profit || 0).toFixed(2)}</TableCell>
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

