import Head from "next/head"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/lib/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mary Kay Manager",
  description: "Sistema de gerenciamento de produtos Mary Kay",
  generator: "fabio",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.marykaymanager.com",
  },
  openGraph: {
    title: "Mary Kay Manager",
    description: "Sistema de gerenciamento de produtos Mary Kay",
    url: "https://www.marykaymanager.com",
    siteName: "Mary Kay Manager",
    images: [
      {
        url: "https://www.marykaymanager.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mary Kay Manager",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mary Kay Manager",
    description: "Sistema de gerenciamento de produtos Mary Kay",
    images: ["https://www.marykaymanager.com/og-image.jpg"],
    site: "@marykaymanager",
  },
  metadataBase: new URL("https://www.marykaymanager.com"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <ClerkProvider appearance={{ baseTheme: dark }}>
            <ScrollArea className="h-full w-full">
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
