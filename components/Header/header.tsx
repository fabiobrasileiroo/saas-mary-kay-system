"use client"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { ShoppingCart, Menu } from "lucide-react"
import { useState } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Image src={"/marykayflow.png"}
            width={50}
            height={50}
            alt="mary kay flow logo"
          />
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/products">Produtos</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/sales">Vendas</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/reports">Relatórios</Link>
          </Button>
          {/* <ThemeToggle /> */}
        </nav>

        <div className="hidden md:flex gap-2">
          <UserButton afterSignOutUrl="/" showName />
          <ThemeToggle />
        </div>

        <div className="md:hidden max-md:w-[55%] flex max-md:justify-between items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4 p-4">
              <Link href="/products" onClick={() => setIsOpen(false)}>Produtos</Link>
              <Link href="/sales" onClick={() => setIsOpen(false)}>Vendas</Link>
              <Link href="/reports" onClick={() => setIsOpen(false)}>Relatórios</Link>
              <ThemeToggle />
            </SheetContent>
          </Sheet>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
