// components/header.tsx
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { ShoppingCart } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-pink-500" />
          <h1 className="text-xl font-bold">Mary Kay Manager</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/products">Produtos</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/sales">Vendas</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/reports">Relatórios</Link>
          </Button>
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" showName />
        </nav>
      </div>
    </header>
  )
}