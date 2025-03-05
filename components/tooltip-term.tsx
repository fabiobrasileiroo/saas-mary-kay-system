"use client"

import { useState, useEffect, type ReactNode } from "react"
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
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    }

    // Check on initial load
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Handle click for mobile devices
  const handleClick = () => {
    if (isMobile) {
      setOpen(!open)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} open={isMobile ? open : undefined} onOpenChange={isMobile ? setOpen : undefined}>
        <TooltipTrigger asChild onClick={handleClick}>
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

