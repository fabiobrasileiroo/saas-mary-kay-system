"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

import { getClients, createClient, updateClient, deleteClient } from "@/lib/actions"

const clientSchema = z.object({
  customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  customerPhone: z.string().optional(),
  description: z.string().optional(),
})

type ClientFormValues = z.infer<typeof clientSchema>

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentClient, setCurrentClient] = useState<any | null>(null)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      description: "",
    },
  })

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    setIsLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: ClientFormValues) {
    try {
      if (currentClient) {
        await updateClient(currentClient.id, values)
        toast({ title: "Sucesso", description: "Cliente atualizado com sucesso." })
      } else {
        await createClient(values)
        toast({ title: "Sucesso", description: "Cliente criado com sucesso." })
      }
      loadClients()
      form.reset()
      setCurrentClient(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cliente.",
        variant: "destructive",
      })
    }
  }

  function handleEdit(client: any) {
    setCurrentClient(client)
    form.reset({
      customerName: client.customerName,
      customerPhone: client.customerPhone || "",
      description: client.description || "",
    })
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient(id)
        toast({ title: "Sucesso", description: "Cliente excluído com sucesso." })
        loadClients()
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o cliente.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="mx-auto container max-md:px-2 max-lg:px-4 py-5 md:py-10 ">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{currentClient ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
          <CardDescription>
            {currentClient ? "Atualize os dados do cliente" : "Adicione um novo cliente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{currentClient ? "Atualizar Cliente" : "Criar Cliente"}</Button>
              {currentClient && (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-2"
                  onClick={() => {
                    setCurrentClient(null)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Lista de todos os clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.customerName}</TableCell>
                    <TableCell>{client.customerPhone || "-"}</TableCell>
                    <TableCell>{client.description || "-"}</TableCell>
                    <TableCell>{format(new Date(client.createdAt), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

