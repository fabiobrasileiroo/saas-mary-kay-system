import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/lib/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mary Kay Manager",
  description: "Sistema de gerenciamento de produtos Mary Kay",
  generator: 'fabio'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <ClerkProvider
            appearance={{
              baseTheme: dark,
            }}
          >
            {/* Apply ScrollArea globally */}
            <ScrollArea className="h-full w-full">
              {/* {children} */}
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </ScrollArea>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
import { ScrollArea } from "@radix-ui/react-scroll-area"
