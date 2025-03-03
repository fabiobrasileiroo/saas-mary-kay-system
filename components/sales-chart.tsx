"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getSales } from "@/lib/actions"
import { useEffect, useState } from "react"
import type { Sale } from "@/lib/types"

interface SalesChartProps {
  showProfit?: boolean
  data?: Array<{
    name: string
    vendas: number
    lucro?: number
    custos_extras?: number
    outras_despesas?: number
  }> | Array<{
    month: string
    total: number
  }>
  sales?: Sale[]
}

export function SalesChart({ showProfit = false, data, sales }: SalesChartProps) {
  // Estado local para os dados formatados
  const [localData, setLocalData] = useState<any[]>([])

  // Function to normalize data to the expected format
  const normalizeData = (inputData: any[]) => {
    return inputData.map(item => {
      // Check if data is already in the expected format
      if ('vendas' in item) {
        return item;
      }
      
      // Convert from { month, total } format to expected format
      if ('month' in item && 'total' in item) {
        return {
          name: item.month,
          vendas: item.total,
          lucro: 0, // Default values
          custos_extras: 0,
          outras_despesas: 0
        };
      }
      
      // Unknown format, return empty structure
      return {
        name: 'Unknown',
        vendas: 0,
        lucro: 0,
        custos_extras: 0,
        outras_despesas: 0
      };
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Use provided data if available
        if (data && data.length > 0) {
          setLocalData(normalizeData(data));
          return;
        }
        
        // Se sales foi fornecido via props, use-o
        const salesData = sales || await getSales()
        
        // Agrupar vendas por mês para o gráfico
        const salesByMonth = salesData.reduce<Record<string, any>>((acc, sale) => {
          const month = new Date(sale.date).toLocaleDateString('pt-BR', { month: 'short' })
          
          if (!acc[month]) {
            acc[month] = {
              name: month,
              vendas: 0,
              lucro: 0,
              custos_extras: 0,
              outras_despesas: 0
            }
          }
          
          acc[month].vendas += sale.total
          acc[month].lucro += sale.profit || 0
          acc[month].custos_extras += sale.extraCosts
          acc[month].outras_despesas += sale.otherExpenses
          
          return acc
        }, {})
        
        // Converter para array
        const formattedData = Object.values(salesByMonth)
        
        setLocalData(formattedData)
      } catch (error) {
        console.error("Erro ao carregar dados de vendas:", error)
        // Fallback para dados estáticos
        setLocalData([
          { name: "Jan", vendas: 4000, lucro: 2400, custos_extras: 200, outras_despesas: 100 },
          { name: "Fev", vendas: 3000, lucro: 1398, custos_extras: 150, outras_despesas: 80 },
        ])
      }
    }
    
    loadData()
  }, [data, sales])

  // Use the normalized data for the chart
  const chartData = localData;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
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