"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getSales } from "@/lib/actions"
import type { Sale } from "@/lib/types"

interface RecentSalesProps {
  showAll?: boolean
}

export function RecentSales({ showAll = false }: RecentSalesProps) {
  const [sales, setSales] = useState<Sale[]>([])

  useEffect(() => {
    async function loadSales() {
      try {
        const data = await getSales()
        setSales(data)
      } catch (error) {
        console.error("Erro ao carregar vendas:", error)
      }
    }

    loadSales()
  }, [])

  // Mostrar apenas as 5 vendas mais recentes, a menos que showAll seja true
  const displaySales = showAll ? sales : sales.slice(0, 5)

  return (
    <div className="space-y-8">
      {displaySales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-pink-100 text-pink-800">
              {sale.customerName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(sale.date), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="ml-auto font-medium">R$ {sale.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}

