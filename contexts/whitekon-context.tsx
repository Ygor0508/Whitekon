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
}

const WhitekonContext = createContext<WhitekonContextType | undefined>(undefined)

export function useWhitekon() {
  const context = useContext(WhitekonContext)
  if (context === undefined) {
    throw new Error("useWhitekon must be used within a WhitekonProvider")
  }
  return context
}

interface WhitekonProviderProps {
  children: React.ReactNode
}

export function WhitekonProvider({ children }: WhitekonProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionParams, setConnectionParams] = useState<{
    port: string
    baudRate: string
    address: string
  } | null>(null)
  const [whitekonData, setWhitekonData] = useState<any>(null)
  const [lastConnectionCheck, setLastConnectionCheck] = useState(0)

  const { toast } = useToast()
  const whitekonService = WhitekonService.getInstance()

  // Verifica conexão com throttling mais agressivo
  const checkConnection = useCallback(async (): Promise<boolean> => {
    const now = Date.now()
    // Só verifica a cada 30 segundos para reduzir interferência
    if (now - lastConnectionCheck < 30000) {
      return isConnected
    }

    try {
      setLastConnectionCheck(now)
      const connected = await whitekonService.checkConnectionStatus()

      if (connected !== isConnected) {
        setIsConnected(connected)

        if (!connected && connectionParams) {
          console.log("Conexão perdida, tentando reconectar em 5 segundos...")
          // Tenta reconectar automaticamente após delay maior
          setTimeout(() => {
            if (connectionParams) {
              connect(connectionParams.port, connectionParams.baudRate, connectionParams.address)
            }
          }, 5000)
        }
      }

      return connected
    } catch (error) {
      console.error("Erro ao verificar conexão:", error)
      // Não marca como desconectado em caso de erro
      return isConnected
    }
  }, [isConnected, lastConnectionCheck, connectionParams])

  // Conecta ao WhiteKon
  const connect = useCallback(
    async (port: string, baudRate: string, address: string): Promise<boolean> => {
      if (isConnecting) {
        console.log("Já está conectando, ignorando nova tentativa")
        return false
      }

      // Se já está conectado com os mesmos parâmetros, não reconecta
      if (
        isConnected &&
        connectionParams &&
        connectionParams.port === port &&
        connectionParams.baudRate === baudRate &&
        connectionParams.address === address
      ) {
        console.log("Já conectado com os mesmos parâmetros")
        return true
      }

      setIsConnecting(true)

      try {
        console.log(`Tentando conectar: ${port}, ${baudRate}, ${address}`)

        const success = await whitekonService.connect(port, baudRate, address)

        if (success) {
          // Testa comunicação RTU lendo um registro para confirmar conexão
          try {
            await whitekonService.readRegister(0) // Tenta ler registro de modo de operação

            setIsConnected(true)
            setConnectionParams({ port, baudRate, address })

            // Salva parâmetros no localStorage para persistir entre sessões
            localStorage.setItem("whitekon-connection", JSON.stringify({ port, baudRate, address }))

            toast({
              title: "Conectado ao WhiteKon",
              description: `Comunicação RTU estabelecida com sucesso (Endereço ${address})`,
            })
          } catch (rtuError) {
            // Falha na comunicação RTU
            await whitekonService.disconnect()
            setIsConnected(false)
            setConnectionParams(null)

            toast({
              title: "Falha na comunicação RTU",
              description: `Porta ${port} aberta, mas não há resposta do WhiteKon no endereço ${address}`,
              variant: "destructive",
            })
            return false
          }
        } else {
          setIsConnected(false)
          setConnectionParams(null)

          toast({
            title: "Falha na conexão",
            description: `Não foi possível abrir a porta ${port}`,
            variant: "destructive",
          })
        }

        return success
      } catch (error: any) {
        console.error("Erro ao conectar:", error)
        setIsConnected(false)
        setConnectionParams(null)

        toast({
          title: "Erro de conexão",
          description: error.message || "Erro ao conectar",
          variant: "destructive",
        })

        return false
      } finally {
        setIsConnecting(false)
      }
    },
    [isConnecting, isConnected, connectionParams, toast],
  )

  // Desconecta do WhiteKon
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await whitekonService.disconnect()
      setIsConnected(false)
      setConnectionParams(null)
      setWhitekonData(null)

      // Remove parâmetros salvos
      localStorage.removeItem("whitekon-connection")

      toast({
        title: "Desconectado",
        description: "Conexão encerrada com sucesso",
      })
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      toast({
        title: "Erro ao desconectar",
        description: "Erro ao encerrar conexão",
        variant: "destructive",
      })
    }
  }, [toast])

  // Efeito para inscrever-se nas atualizações de dados
  useEffect(() => {
    const unsubscribe = whitekonService.onDataUpdate((data) => {
      setWhitekonData(data)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Efeito para tentar reconectar automaticamente ao carregar a página
  useEffect(() => {
    const tryAutoReconnect = async () => {
      try {
        const savedConnection = localStorage.getItem("whitekon-connection")
        if (savedConnection) {
          const params = JSON.parse(savedConnection)
          console.log("Tentando reconexão automática com parâmetros salvos:", params)

          // Verifica se já está conectado primeiro
          const currentlyConnected = await whitekonService.checkConnectionStatus()
          if (currentlyConnected) {
            setIsConnected(true)
            setConnectionParams(params)
            console.log("Já estava conectado")
          } else {
            // Tenta reconectar
            await connect(params.port, params.baudRate, params.address)
          }
        }
      } catch (error) {
        console.error("Erro na reconexão automática:", error)
      }
    }

    // Delay para evitar conflitos na inicialização
    const timer = setTimeout(tryAutoReconnect, 2000)
    return () => clearTimeout(timer)
  }, [connect])

  // Efeito para verificação periódica de conexão (reduzida)
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      checkConnection()
    }, 60000) // Verifica apenas a cada 60 segundos

    return () => clearInterval(interval)
  }, [isConnected, checkConnection])

  const value: WhitekonContextType = {
    isConnected,
    isConnecting,
    connectionParams,
    whitekonData,
    connect,
    disconnect,
    checkConnection,
  }

  return <WhitekonContext.Provider value={value}>{children}</WhitekonContext.Provider>
}
