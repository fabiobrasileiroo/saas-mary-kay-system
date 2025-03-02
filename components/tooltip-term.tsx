"use client"

import type { ReactNode } from "react"
import { HelpCircle } from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TooltipTermProps {
  term: string
  children: ReactNode
}

// Dicionário de termos técnicos
const termDefinitions: Record<string, string> = {
  CRUD: "Create, Read, Update, Delete - Operações básicas para manipulação de dados em sistemas.",
  SKU: "Stock Keeping Unit - Código único que identifica cada produto no estoque.",
  "Ticket Médio": "Valor médio gasto por cliente em cada compra.",
  "Margem de Lucro": "Percentual de lucro obtido em relação ao preço de venda.",
  "Receita Bruta": "Valor total das vendas antes de descontar custos e despesas.",
  "Lucro Bruto": "Receita total menos o custo dos produtos vendidos.",
  "Lucro Líquido": "Lucro após descontar todos os custos, despesas e impostos.",
  Estoque: "Quantidade de produtos disponíveis para venda.",
  "Fluxo de Caixa": "Movimento de entrada e saída de dinheiro em um negócio.",
  "Valor Bruto": "Valor total antes de descontos ou deduções.",
  "Valor Líquido": "Valor final após todos os descontos e deduções.",
  Inventário: "Registro detalhado de todos os produtos em estoque.",
  Categoria: "Classificação que agrupa produtos com características semelhantes.",
  "Preço de Custo": "Valor pago para adquirir ou produzir um produto.",
  "Preço de Venda": "Valor pelo qual o produto é oferecido ao cliente final.",
}

export function TooltipTerm({ term, children }: TooltipTermProps) {
  const definition = termDefinitions[term] || "Definição não disponível"

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help border-b border-dotted border-muted-foreground">
            {children}
            <HelpCircle className="ml-1 h-3 w-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3">
          <p className="text-sm">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

