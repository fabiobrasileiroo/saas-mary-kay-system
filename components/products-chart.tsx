"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { getTopProducts } from "@/lib/actions"

export function ProductsChart() {
  const [data, setData] = useState<any[]>([])
  const COLORS = ["#ff5c8d", "#ff1694", "#ff85a1", "#ff3385", "#ff99b4"]

  useEffect(() => {
    async function loadData() {
      try {
        const productsData = await getTopProducts()
        setData(productsData)
      } catch (error) {
        console.error("Erro ao carregar dados de produtos:", error)
        // Dados de exemplo para visualização
        setData([
          { name: "Batom Gel Semi-Matte", value: 400 },
          { name: "TimeWise 3D", value: 300 },
          { name: "Base Líquida TimeWise", value: 300 },
          { name: "Máscara para Cílios", value: 200 },
          { name: "Perfume Thinking of You", value: 100 },
        ])
      }
    }

    loadData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} unidades`, "Quantidade"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

