"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Sale } from "@prisma/client"

interface RecentSalesProps {
  showAll?: boolean
  sales?: Sale[]
}

export function RecentSales({ showAll = false, sales = [] }: RecentSalesProps) {
  // Ordenar vendas por data mais recente
  const sortedSales = [...sales].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Limitar a 5 itens se não for para mostrar todos
  const displaySales = showAll ? sortedSales : sortedSales.slice(0, 5)

  return (
    <div className="space-y-8">
      {displaySales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
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
          <div className="ml-auto font-medium">
            {sale.total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
        </div>
      ))}
      {displaySales.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma venda registrada
        </div>
      )}
    </div>
  )
}