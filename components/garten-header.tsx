"use client"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { Clock, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function GartenHeader() {
  // Estado para armazenar a hora atual
  const [currentTime, setCurrentTime] = useState(new Date());

  // Efeito para atualizar a hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(timer);
  }, []); // O array vazio garante que o efeito rode apenas uma vez

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#a60000] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-[#a60000] text-xl">SISTEMA DE MONITORAMENTO DE BRANCURA - WHITEKON</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-[#a60000] transition-colors">
            Dispositivos
          </Link>
          <Link href="/whitekon/lista" className="text-gray-600 hover:text-[#a60000] transition-colors">
            WhiteKons
          </Link>
          <Link href="/whitekon/cadastro" className="text-gray-600 hover:text-[#a60000] transition-colors">
            Cadastrar
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{currentTime.toLocaleString("pt-BR")}</span>
          </div>

        

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/whitekon/lista">WhiteKons</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/whitekon/cadastro">Cadastrar</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
