"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { getSalesData } from "@/lib/actions"

interface SalesChartProps {
  showProfit?: boolean
}

export function SalesChart({ showProfit = false }: SalesChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const salesData = await getSalesData()
        setData(salesData)
      } catch (error) {
        console.error("Erro ao carregar dados de vendas:", error)
        // Dados de exemplo para visualização
        setData([
          { name: "Jan", vendas: 4000, lucro: 2400, custos_extras: 200, outras_despesas: 100 },
          { name: "Fev", vendas: 3000, lucro: 1398, custos_extras: 150, outras_despesas: 80 },
          { name: "Mar", vendas: 2000, lucro: 9800, custos_extras: 180, outras_despesas: 90 },
          { name: "Abr", vendas: 2780, lucro: 3908, custos_extras: 220, outras_despesas: 110 },
          { name: "Mai", vendas: 1890, lucro: 4800, custos_extras: 170, outras_despesas: 85 },
          { name: "Jun", vendas: 2390, lucro: 3800, custos_extras: 190, outras_despesas: 95 },
          { name: "Jul", vendas: 3490, lucro: 4300, custos_extras: 210, outras_despesas: 105 },
        ])
      }
    }

    loadData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="vendas" name="Vendas (R$)" fill="#ff5c8d" />
        {showProfit && <Bar dataKey="lucro" name="Lucro (R$)" fill="#ff1694" />}
        <Bar dataKey="custos_extras" name="Custos Extras (R$)" fill="#ffa07a" />
        <Bar dataKey="outras_despesas" name="Outras Despesas (R$)" fill="#20b2aa" />
      </BarChart>
    </ResponsiveContainer>
  )
}

