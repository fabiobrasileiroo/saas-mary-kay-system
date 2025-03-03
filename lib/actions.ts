"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient, Product, Sale, SaleItem } from "@prisma/client";

const prisma = new PrismaClient();

// Funções CRUD para produtos
// types.ts
// export type Product = {
//   id: string
//   userId: string | null
//   name: string
//   category: string
//   description: string
//   costPrice: number
//   sellingPrice: number
//   stock: number
//   sku: string
//   createdAt: string // Como string
//   updatedAt: string // Como string
// }

// actions.ts
export async function getProducts() {
  const { userId } = await auth();
  const products = await prisma.product.findMany({
    where: { userId }
  });
  
  return products.map(product => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  }));
}
export async function getProduct(id: string) {
  const { userId } = await auth();
  return await prisma.product.findUnique({ where: { id ,userId} });
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Garantindo que o 'userId' seja incluído nos dados do produto
  return await prisma.product.create({
    data: {
      ...data,
      userId, // userId está sendo adicionado aqui
    },
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const { userId } = await auth(); // Buscar userId da autenticação
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return await prisma.product.update({
    where: {
      id,        // id do produto
      userId,    // garantir que o produto pertence ao usuário autenticado
    },
    data,
  });
}

export async function deleteProduct(id: string) {
  const { userId } = await auth(); // Buscar userId da autenticação
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return await prisma.product.delete({
    where: {
      id,        // id do produto
      userId,    // garantir que o produto pertence ao usuário autenticado
    },
  });
}

// Exemplo para getSales
export async function getSales() {
  const { userId } = await auth();
  const sales = await prisma.sale.findMany({
    where: { userId },
    include: { items: true }
  });

  return sales.map(sale => ({
    ...sale,
    date: sale.date.toISOString(),
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    items: sale.items.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))
  }));
}

export async function getSale(id: string) {
  const { userId } = await auth(); // Buscar userId da autenticação
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return await prisma.sale.findUnique({
    where: {
      id,        // id da venda
      userId,    // garantir que a venda pertence ao usuário autenticado
    },
    include: { items: true },
  });
}

export async function createSale(data: Omit<Sale, "id" | "createdAt" | "updatedAt" | "profit" | 'userId'> & { 
  items: { 
    productId: string
    quantity: number
    price: number
    productName: string
  }[] 
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  return await prisma.$transaction(async (prisma) => {
    let profit = 0;

    const items = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findUnique({ 
          where: { id: item.productId } 
        });
        if (!product) throw new Error("Produto não encontrado");

        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity },updatedAt: new Date() },
        });

        const itemProfit = (item.price - product.costPrice) * item.quantity;
        profit += itemProfit;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          userId // Adicionado
        };
      })
    );

    profit -= data.transportCost + data.extraCosts + data.otherExpenses;

    return await prisma.sale.create({
      data: {
        ...data,
        userId, // Adicionado
        profit,
        items: { create: items },
      },
      include: { items: true },
    });
  });
}

export async function deleteSale(id: string) {
  const { userId } = await auth(); // Buscar userId da autenticação
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return await prisma.sale.delete({
    where: {
      id,        // id da venda
      userId,    // garantir que a venda pertence ao usuário autenticado
    },
  });
}

export async function getFinancialMetrics() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const sales = await prisma.sale.findMany({
    where: { userId },
    include: { items: true }
  });

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const netProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalExpenses = sales.reduce((sum, sale) => sum + sale.transportCost + sale.extraCosts + sale.otherExpenses, 0);
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;

  return {
    totalSales: Number(totalSales.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    averageTicket: Number(averageTicket.toFixed(2))
  };
}


export async function getTopProducts() {
  try {
    // Get the current date
    const now = new Date();
    
    // Set the date to 30 days ago for the default timeframe
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Query to get the top selling products
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5, // Limit to top 5 products
    });

    // Get the product details for each top product
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        
        return {
          name: product?.name || "Produto desconhecido",
          value: item._sum.quantity || 0,
        };
      })
    );

    return productsWithDetails;
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw new Error("Failed to fetch top products");
  }
}

// import { revalidatePath } from "next/cache"
// import { v4 as uuidv4 } from "uuid"
// import type { Product, Sale } from "./types"

// // Simulação de banco de dados com armazenamento em memória
// let products: Product[] = [
//   {
//     id: "1",
//     name: "Batom Gel Semi-Matte",
//     category: "makeup",
//     description: "Batom de longa duração com acabamento semi-matte",
//     costPrice: 25.5,
//     sellingPrice: 59.9,
//     stock: 15,
//     sku: "MK-1001",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     name: "TimeWise 3D",
//     category: "skincare",
//     description: "Creme anti-idade para todos os tipos de pele",
//     costPrice: 89.9,
//     sellingPrice: 199.9,
//     stock: 8,
//     sku: "MK-2001",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: "3",
//     name: "Base Líquida TimeWise",
//     category: "makeup",
//     description: "Base líquida de cobertura média a alta",
//     costPrice: 45.5,
//     sellingPrice: 99.9,
//     stock: 12,
//     sku: "MK-1002",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: "4",
//     name: "Perfume Thinking of You",
//     category: "fragrance",
//     description: "Fragrância floral com notas de jasmim e baunilha",
//     costPrice: 65.0,
//     sellingPrice: 149.9,
//     stock: 10,
//     sku: "MK-3001",
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ]

// const sales: Sale[] = [
//   {
//     id: "1",
//     customerName: "Maria Silva",
//     customerPhone: "(11) 98765-4321",
//     paymentMethod: "credit",
//     items: [
//       {
//         id: "1",
//         productId: "1",
//         quantity: 2,
//         price: 59.9,
//         productName: "Batom Gel Semi-Matte",
//       },
//       {
//         id: "2",
//         productId: "2",
//         quantity: 1,
//         price: 199.9,
//         productName: "TimeWise 3D",
//       },
//     ],
//     total: 319.7,
//     profit: 144.8,
//     date: new Date().toISOString(),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     transportCost: 10,
//     otherExpenses: 5,
//     extraCosts: 0,
//   },
//   {
//     id: "2",
//     customerName: "Ana Oliveira",
//     customerPhone: "(11) 91234-5678",
//     paymentMethod: "pix",
//     items: [
//       {
//         id: "1",
//         productId: "3",
//         quantity: 1,
//         price: 99.9,
//         productName: "Base Líquida TimeWise",
//       },
//     ],
//     total: 99.9,
//     profit: 54.4,
//     date: new Date().toISOString(),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     transportCost: 0,
//     otherExpenses: 0,
//     extraCosts: 0,
//   },
// ]

// // Funções para gerenciar produtos
// export async function getProducts(): Promise<Product[]> {
//   return products
// }

// export async function getProduct(id: string): Promise<Product | null> {
//   const product = products.find((p) => p.id === id)
//   return product || null
// }

// export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
//   const now = new Date().toISOString()
//   const newProduct: Product = {
//     id: uuidv4(),
//     ...productData,
//     createdAt: now,
//     updatedAt: now,
//   }

//   products.push(newProduct)
//   revalidatePath("/products")
//   return newProduct
// }

// export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
//   const index = products.findIndex((p) => p.id === id)

//   if (index === -1) {
//     return null
//   }

//   const updatedProduct = {
//     ...products[index],
//     ...productData,
//     updatedAt: new Date().toISOString(),
//   }

//   products[index] = updatedProduct
//   revalidatePath("/products")
//   return updatedProduct
// }

// export async function deleteProduct(id: string): Promise<boolean> {
//   const initialLength = products.length
//   products = products.filter((p) => p.id !== id)

//   const deleted = initialLength > products.length
//   if (deleted) {
//     revalidatePath("/products")
//   }

//   return deleted
// }

// // Funções para gerenciar vendas
// export async function getSales(): Promise<Sale[]> {
//   return sales
// }

// export async function getSale(id: string): Promise<Sale | null> {
//   const sale = sales.find((s) => s.id === id)
//   return sale || null
// }

// export async function createSale(saleData: Omit<Sale, "id" | "profit" | "createdAt" | "updatedAt">): Promise<Sale> {
//   const now = new Date().toISOString()

//   // Calcular o lucro da venda
//   let profit = 0
//   for (const item of saleData.items) {
//     const product = products.find((p) => p.id === item.productId)
//     if (product) {
//       // Atualizar o estoque
//       product.stock -= item.quantity

//       // Calcular o lucro deste item
//       const itemProfit = (item.price - product.costPrice) * item.quantity
//       profit += itemProfit
//     }
//   }

//   // Subtrair os custos e despesas adicionais do lucro
//   profit -= saleData.transportCost + saleData.extraCosts + saleData.otherExpenses

//   const newSale: Sale = {
//     id: uuidv4(),
//     ...saleData,
//     profit,
//     createdAt: now,
//     updatedAt: now,
//   }

//   sales.push(newSale)
//   revalidatePath("/sales")
//   return newSale
// }

// // Funções para relatórios e análises
// export async function getSalesData() {
//   // Aqui você deve implementar a lógica para calcular os dados reais de vendas
//   // Esta é uma versão simplificada para demonstração
//   const allSales = await getSales()

//   const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

//   const salesData = monthNames.map((month) => {
//     const salesInMonth = allSales.filter((sale) => {
//       const saleDate = new Date(sale.date)
//       return saleDate.getMonth() === monthNames.indexOf(month)
//     })

//     const vendas = salesInMonth.reduce((sum, sale) => sum + sale.total, 0)
//     const lucro = salesInMonth.reduce((sum, sale) => sum + (sale.profit || 0), 0)
//     const custos_extras = salesInMonth.reduce((sum, sale) => sum + sale.extraCosts, 0)
//     const outras_despesas = salesInMonth.reduce((sum, sale) => sum + sale.otherExpenses, 0)

//     return {
//       name: month,
//       vendas,
//       lucro,
//       custos_extras,
//       outras_despesas,
//     }
//   })

//   return salesData
// }

// export async function getTopProducts() {
//   // Simulação de dados para o gráfico de produtos mais vendidoslib/actions
//   return [
//     { name: "Batom Gel Semi-Matte", value: 400 },
//     { name: "TimeWise 3D", value: 300 },
//     { name: "Base Líquida TimeWise", value: 300 },
//     { name: "Máscara para Cílios", value: 200 },
//     { name: "Perfume Thinking of You", value: 100 },
//   ]
// }

