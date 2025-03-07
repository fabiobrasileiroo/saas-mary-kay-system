import Head from "next/head"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider, useTheme } from "@/lib/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Header } from "@/components/Header/header"

const inter = Inter({ subsets: ["latin"] })
const baseUrl = "https://mary-kay-flow.vercel.app"

export const metadata: Metadata = {
  title: "Mary Kay Flow",
  description: "Sistema de gerenciamento de produtos Mary Kay",
  generator: "fabio",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Mary Kay flow",
    description: "Sistema de gerenciamento de produtos Mary Kay",
    url: `${baseUrl}/bg-login.png`,
    siteName: "Mary Kay Flow",
    images: [
      {
        url: `${baseUrl}/bg-login.png`,
        width: 1200,
        height: 630,
        alt: "Mary Kay Flow",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mary Kay Manager",
    description: "Sistema de gerenciamento de produtos Mary Kay",
    images: [`${baseUrl}/bg-login.png`],
    site: "@marykayflow",
  },
  metadataBase: new URL(baseUrl),
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
        {/* <Header /> */}
        <ThemeProvider defaultTheme="system">
          <ClerkProvider appearance={{ baseTheme:  dark }}>
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
