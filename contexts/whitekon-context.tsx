"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { WhitekonService } from "@/lib/whitekon-service"
import { useToast } from "@/hooks/use-toast"
interface WhitekonContextType {
  isConnected: boolean
  isConnecting: boolean
  connectionParams: {
    port: string
    baudRate: string
    address: string
  } | null
  whitekonData: any
  connect: (port: string, baudRate: string, address: string) => Promise<boolean>
  disconnect: () => Promise<void>
  checkConnection: () => Promise<boolean>
  readRegister: (address: number) => Promise<number | null>
  writeRegister: (address: number, value: number) => Promise<boolean>
  readAllRegisters: () => Promise<{ [key: number]: number | null }>
}

const WhitekonContext = createContext<WhitekonContextType | undefined>(undefined)

export function useWhitekon() {
  const context = useContext(WhitekonContext)
  if (context === undefined) {
    throw new Error("useWhitekon must be used within a WhitekonProvider")
  }
  return context
}

export function WhitekonProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionParams, setConnectionParams] = useState<{
    port: string
    baudRate: string
    address: string
  } | null>(null)
  const [whitekonData, setWhitekonData] = useState<any>(null)

  const { toast } = useToast()
  const whitekonService = WhitekonService.getInstance()

  const connect = useCallback(
    async (port: string, baudRate: string, address: string): Promise<boolean> => {
      if (isConnecting) return false
      
      setIsConnecting(true)
      try {
        const success = await whitekonService.connect(port, baudRate, address)
        
        if (success) {
          await whitekonService.readRegister(0)
          
          toast({ title: "Conectado. Configurando estado padrão do dispositivo..." })
          await whitekonService.writeRegister(29, 0)
          await whitekonService.writeRegister(0, 0)
          await whitekonService.writeRegister(28, 0)
          
          setIsConnected(true)
          setConnectionParams({ port, baudRate, address })
          localStorage.setItem("whitekon-connection", JSON.stringify({ port, baudRate, address }))
          
          toast({
            title: "Dispositivo Pronto",
            description: `Conectado em modo Normal e Automático (Endereço ${address})`,
          })
          return true
        } else {
            throw new Error("Falha ao abrir a porta de comunicação.")
        }
      } catch (error: any) {
        setIsConnected(false)
        setConnectionParams(null)
        await whitekonService.disconnect()
        toast({
          title: "Erro de conexão",
          description: error.message || "Não foi possível comunicar com o dispositivo.",
          variant: "destructive",
        })
        return false
      } finally {
        setIsConnecting(false)
      }
    },
    // Adicionado `whitekonService` e outras dependências ao array
    [isConnecting, isConnected, connectionParams, toast, whitekonService]
  )

  const disconnect = useCallback(async (): Promise<void> => {
    await whitekonService.disconnect()
    setIsConnected(false)
    setConnectionParams(null)
    setWhitekonData(null)
    localStorage.removeItem("whitekon-connection")
    toast({ title: "Desconectado" })
  }, [toast, whitekonService])
  
  const checkConnection = useCallback(async (): Promise<boolean> => {
    return isConnected
  }, [isConnected])

  useEffect(() => {
    const unsubscribe = whitekonService.onDataUpdate((data) => setWhitekonData(data))
    return () => unsubscribe()
  }, [whitekonService])

  // Objeto de valor do Provider CORRIGIDO
  const value: WhitekonContextType = {
    isConnected,
    isConnecting,
    connectionParams,
    whitekonData,
    connect,
    disconnect,
    checkConnection, // <-- Propriedade adicionada ao objeto
    readRegister: useCallback((address: number) => whitekonService.readRegister(address), [whitekonService]),
    writeRegister: useCallback((address: number, value: number) => whitekonService.writeRegister(address, value), [whitekonService]),
    readAllRegisters: useCallback(() => whitekonService.readAllRegisters(), [whitekonService]),
  }

  return <WhitekonContext.Provider value={value}>{children}</WhitekonContext.Provider>
}