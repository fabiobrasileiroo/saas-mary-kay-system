"use server";

import { prisma } from '@/lib/prisma'
import { auth } from "@clerk/nextjs/server";
import {  Product, Sale,Client } from "@prisma/client";


// **Buscar todos os clientes do usuário autenticado**
export async function getClients() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const clients = await prisma.client.findMany({
    where: { userId },
    include: { sales: true },
  });

  return clients.map(client => ({
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }));
}

// **Buscar um único cliente pelo ID**
export async function getClient(id: string) {
  const { userId } = await auth();
  console.log("🚀 ~ getClient ~ userId:", userId)
  if (!userId) throw new Error("User not authenticated");

  return await prisma.client.findUnique({
    where: { id, userId },
    include: { sales: true },
  });
}

// **Criar um novo cliente**
export async function createClient(data: Omit<Client, "id" | "createdAt" | "updatedAt" | "userId">) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  return await prisma.client.create({
    data: {
      ...data,
      userId, // Associar cliente ao usuário autenticado
    },
  });
}

// **Atualizar um cliente existente**
export async function updateClient(id: string, data: Partial<Client>) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  return await prisma.client.update({
    where: { id, userId },
    data,
  });
}

// **Deletar um cliente**
export async function deleteClient(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  return await prisma.client.delete({
    where: { id, userId },
  });
}


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
  return await prisma.product.findUnique({ where: { id, userId } });
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
          data: { stock: { decrement: item.quantity }, updatedAt: new Date() },
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