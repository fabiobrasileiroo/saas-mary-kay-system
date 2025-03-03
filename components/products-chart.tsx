"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { getTopProducts } from "@/lib/actions"
import type { Product } from "@/lib/types"

interface ProductsChartProps {
  products?: Product[]
  saleItems?: Array<{
    productId: string
    quantity: number
  }>
}

export function ProductsChart({ products, saleItems }: ProductsChartProps) {
  const [data, setData] = useState<any[]>([])
  const COLORS = ["#ff5c8d", "#ff1694", "#ff85a1", "#ff3385", "#ff99b4"]
  
  useEffect(() => {
    async function loadData() {
      try {
        // If products and saleItems are provided, process them
        if (products && products.length > 0) {
          let chartData: Array<{ name: string, value: number }> = [];
          
          if (saleItems && saleItems.length > 0) {
            // Count sales by product
            const productSaleCounts: Record<string, number> = {};
            
            // Sum up quantities for each product
            saleItems.forEach(item => {
              productSaleCounts[item.productId] = (productSaleCounts[item.productId] || 0) + item.quantity;
            });
            
            // Map to product names and sort by sales count
            const topProductIds = Object.entries(productSaleCounts)
              .sort(([, countA], [, countB]) => countB - countA)
              .slice(0, 5)
              .map(([id, count]) => ({ id, count }));
            
            // Create chart data
            chartData = topProductIds.map(({ id, count }) => {
              const product = products.find(p => p.id === id);
              return {
                name: product?.name || "Produto desconhecido",
                value: count
              };
            });
          } else {
            // No sale items data, just use the top 5 products by some other metric (e.g., price)
            chartData = products
              .slice(0, 5)
              .map(product => ({
                name: product.name,
                value: product.stock || 1 // Use stock as a fallback value
              }));
          }
          
          setData(chartData);
        } else {
          // Fetch from API if no props provided
          const productsData = await getTopProducts();
          setData(productsData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de produtos:", error);
        // Dados de exemplo para visualização
        setData([
          { name: "Batom Gel Semi-Matte", value: 400 },
          { name: "TimeWise 3D", value: 300 },
          { name: "Base Líquida TimeWise", value: 300 },
          { name: "Máscara para Cílios", value: 200 },
          { name: "Perfume Thinking of You", value: 100 },
        ]);
      }
    }
    
    loadData();
  }, [products, saleItems]);
  
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