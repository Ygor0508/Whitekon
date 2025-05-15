import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ModbusProvider } from "@/contexts/ModbusContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whitekon - Medidor de Brancura",
  description: "Interface de controle para o medidor de brancura Whitekon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ModbusProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="w-full py-4 text-center text-sm text-gray-600">
            Desenvolvido por Garten Automação © 2025
          </footer>
        </ModbusProvider>
      </body>
    </html>
  );
}
