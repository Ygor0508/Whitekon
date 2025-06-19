import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { GartenHeader } from "@/components/garten-header"
import { Toaster } from "@/components/ui/toaster"
import { WhitekonProvider } from "@/contexts/whitekon-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sistema WhiteKon - Garten",
  description: "Sistema de medição de brancura para arroz - Garten",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WhitekonProvider>
            <GartenHeader />
            <main className="min-h-screen bg-gray-100">{children}</main>
            <Toaster />
          </WhitekonProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
