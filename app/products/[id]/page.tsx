"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getProduct, updateProduct, deleteProduct } from "@/lib/actions";
import { Product } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipTerm } from "@/components/tooltip-term";

export default function ProductPage({ params }: { params: { id: string } }) {
  console.log("🚀 ~ ProductPage ~ params:", params)
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(params.id);
        console.log("🚀 ~ loadProduct ~ data:", data)
        if (data) {
          setProduct({
            ...data,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
          });
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      }
    };

    loadProduct();
  }, [params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await updateProduct(params.id, {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        costPrice: Number.parseFloat(formData.get("costPrice") as string),
        sellingPrice: Number.parseFloat(formData.get("sellingPrice") as string),
        stock: Number.parseInt(formData.get("stock") as string),
        sku: formData.get("sku") as string,
      });

      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteProduct(params.id);
      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
    }
  }

  if (!product) {
    return <div className="container py-10">Carregando...</div>;
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Editar Produto</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto "{product.name}" e
                  removerá seus dados do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Produto</CardTitle>
          <CardDescription>Atualize as informações do produto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" required defaultValue={product.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skincare">Cuidados com a Pele</SelectItem>
                    <SelectItem value="makeup">Maquiagem</SelectItem>
                    <SelectItem value="fragrance">Fragrâncias</SelectItem>
                    <SelectItem value="bodycare">Cuidados Corporais</SelectItem>
                    <SelectItem value="accessories">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" defaultValue={product.description} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">
                  <TooltipTerm term="Preço de Custo">Preço de Custo (R$)</TooltipTerm>
                </Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.costPrice}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">
                  <TooltipTerm term="Preço de Venda">Preço de Venda (R$)</TooltipTerm>
                </Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.sellingPrice}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">
                  <TooltipTerm term="Estoque">Quantidade em Estoque</TooltipTerm>
                </Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">
                  <TooltipTerm term="SKU">Código SKU</TooltipTerm>
                </Label>
                <Input id="sku" name="sku" defaultValue={product.sku} required />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Link href="/products">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
