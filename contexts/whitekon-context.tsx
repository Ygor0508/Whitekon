// "use client"

// import type React from "react"
// import { createContext, useContext, useEffect, useState, useCallback } from "react"
// import { WhitekonService } from "@/lib/whitekon-service"
// import { useToast } from "@/hooks/use-toast"

// export interface ChartDataPoint {
//   time: string;
//   timestamp: number; // melhorar controle temporal
//   brancuraMedia: number | null;
//   contadorAmostras: number | null;
//   brancuraOnline: number | null;
// }

// interface WhitekonContextType {
//   isConnected: boolean
//   isConnecting: boolean
//   connectionParams: {
//     port: string
//     baudRate: string
//     address: string
//   } | null
//   whitekonData: any,
//   chartHistory: ChartDataPoint[],
//   connect: (port: string, baudRate: string, address: string) => Promise<boolean>
//   disconnect: () => Promise<void>
//   checkConnection: () => Promise<boolean>
//   readRegister: (address: number) => Promise<number | null>
//   writeRegister: (address: number, value: number) => Promise<boolean>
//   readAllRegisters: () => Promise<{ [key: number]: number | null }>
//   clearChartHistory: () => void //método para limpar histórico
// }

// const WhitekonContext = createContext<WhitekonContextType | undefined>(undefined)

// export function useWhitekon() {
//   const context = useContext(WhitekonContext)
//   if (context === undefined) {
//     throw new Error("useWhitekon must be used within a WhitekonProvider")
//   }
//   return context
// }

// export function WhitekonProvider({ children }: { children: React.ReactNode }) {
//   const [isConnected, setIsConnected] = useState(false)
//   const [isConnecting, setIsConnecting] = useState(false)
//   const [connectionParams, setConnectionParams] = useState<{
//     port: string
//     baudRate: string
//     address: string
//   } | null>(null)
//   const [whitekonData, setWhitekonData] = useState<any>(null)
//   const [chartHistory, setChartHistory] = useState<ChartDataPoint[]>([]);

//   const { toast } = useToast()
//   const whitekonService = WhitekonService.getInstance()

//   // Constante para controle temporal (1 hora em milissegundos)
//   const ONE_HOUR_MS = 60 * 60 * 1000;

//   const connect = useCallback(
//     async (port: string, baudRate: string, address: string): Promise<boolean> => {
//       if (isConnecting) return false
      
//       setIsConnecting(true)
//       try {
//         const success = await whitekonService.connect(port, baudRate, address)
        
//         if (success) {
//           await whitekonService.readRegister(0)
          
//           toast({ title: "Conectado. Configurando estado padrão do dispositivo..." })
//           await whitekonService.writeRegister(29, 0)
//           await whitekonService.writeRegister(0, 0)
//           await whitekonService.writeRegister(28, 0)
          
//           setIsConnected(true)
//           setConnectionParams({ port, baudRate, address })
//           localStorage.setItem("whitekon-connection", JSON.stringify({ port, baudRate, address }))
          
//           toast({
//             title: "Dispositivo Pronto",
//             description: `Conectado em modo Normal e Automático (Endereço ${address})`,
//           })
//           return true
//         } else {
//             throw new Error("Falha ao abrir a porta de comunicação.")
//         }
//       } catch (error: any) {
//         setIsConnected(false)
//         setConnectionParams(null)
//         await whitekonService.disconnect()
//         toast({
//           title: "Erro de conexão",
//           description: error.message || "Não foi possível comunicar com o dispositivo.",
//           variant: "destructive",
//         })
//         return false
//       } finally {
//         setIsConnecting(false)
//       }
//     },
//     [isConnecting, toast, whitekonService]
//   )

//   const disconnect = useCallback(async (): Promise<void> => {
//     await whitekonService.disconnect()
//     setIsConnected(false)
//     setConnectionParams(null)
//     setWhitekonData(null)
//     setChartHistory([])
//     localStorage.removeItem("whitekon-connection")
//     toast({ title: "Desconectado" })
//   }, [toast, whitekonService])
  
//   const checkConnection = useCallback(async (): Promise<boolean> => {
//     return isConnected
//   }, [isConnected])

//   const clearChartHistory = useCallback(() => {
//     setChartHistory([])
//     toast({ title: "Histórico do gráfico limpo" })
//   }, [toast])

//   // Função otimizada para filtrar dados por tempo
//   const filterHistoryByTime = useCallback((history: ChartDataPoint[], currentTime: number) => {
//     const oneHourAgo = currentTime - ONE_HOUR_MS;
//     return history.filter(entry => entry.timestamp >= oneHourAgo);
//   }, [ONE_HOUR_MS]);

// useEffect(() => {
//     const unsubscribe = whitekonService.onDataUpdate((data) => {
//         console.log('🔄 WhiteKon Context - Dados recebidos:', {
//             timestamp: new Date().toISOString(),
//             hasRegisters: !!data?.registers,
//             registers: data?.registers ? {
//                 reg5_brancuraMedia: data.registers[5],
//                 reg19_contador: data.registers[19], 
//                 reg21_brancuraOnline: data.registers[21]
//             } : null
//         });
        
//         setWhitekonData(data)
        
//         if (data?.registers) {
//             const brancuraMedia = data.registers[5];
//             const contadorAmostras = data.registers[19];
//             const brancuraOnlineRaw = data.registers[21];
            
//             console.log('📊 Processando valores para gráfico:', {
//                 brancuraMedia: { raw: brancuraMedia, processed: brancuraMedia != null ? brancuraMedia / 10 : null },
//                 contadorAmostras: { raw: contadorAmostras, processed: contadorAmostras },
//                 brancuraOnline: { raw: brancuraOnlineRaw, processed: brancuraOnlineRaw != null ? brancuraOnlineRaw / 10 : null }
//             });
            
//             // Só adiciona ao histórico se houver dados válidos de brancura
//             if (brancuraMedia !== null && brancuraMedia !== undefined) {
//                 const now = new Date();
//                 const timestamp = now.getTime();
                
//                 const newHistoryEntry: ChartDataPoint = {
//                     time: now.toLocaleTimeString('pt-BR', { 
//                         hour: '2-digit', 
//                         minute: '2-digit', 
//                         second: '2-digit' 
//                     }),
//                     timestamp,
//                     brancuraMedia: brancuraMedia / 10,
//                     contadorAmostras: contadorAmostras, // Mantém valor original
//                     brancuraOnline: brancuraOnlineRaw != null ? brancuraOnlineRaw / 10 : null,
//                 };

//                 console.log('✅ Novo ponto adicionado ao histórico:', newHistoryEntry);

//                 setChartHistory(prevHistory => {
//                     // Filtra dados antigos (mais de 1 hora)
//                     const filteredHistory = filterHistoryByTime(prevHistory, timestamp);
                    
//                     // Evita duplicatas verificando se já existe um ponto muito próximo no tempo
//                     const lastEntry = filteredHistory[filteredHistory.length - 1];
//                     if (lastEntry && (timestamp - lastEntry.timestamp) < 500) {
//                         // Se o último ponto foi há menos de 500ms, substitui em vez de adicionar
//                         const newHistory = [...filteredHistory.slice(0, -1), newHistoryEntry];
//                         console.log('🔄 Ponto substituído, total de pontos:', newHistory.length);
//                         return newHistory;
//                     }
                    
//                     const newHistory = [...filteredHistory, newHistoryEntry];
//                     console.log('➕ Ponto adicionado, total de pontos:', newHistory.length);
//                     return newHistory;
//                 });
//             } else {
//                 console.log('⚠️ Brancura média é null/undefined, ponto não adicionado ao gráfico');
//             }
//         } else {
//             console.log('⚠️ Nenhum registro encontrado nos dados');
//         }
//     });
    
//     return () => unsubscribe()
// }, [whitekonService, filterHistoryByTime])




//   // Limpeza periódica do histórico (a cada 5 minutos)
//   useEffect(() => {
//     const cleanupInterval = setInterval(() => {
//       setChartHistory(prevHistory => 
//         filterHistoryByTime(prevHistory, Date.now())
//       );
//     }, 5 * 60 * 1000); // 5 minutos

//     return () => clearInterval(cleanupInterval);
//   }, [filterHistoryByTime]);

//   const value: WhitekonContextType = {
//     isConnected,
//     isConnecting,
//     connectionParams,
//     whitekonData,
//     chartHistory,
//     connect,
//     disconnect,
//     checkConnection,
//     clearChartHistory,
//     readRegister: useCallback((address: number) => whitekonService.readRegister(address), [whitekonService]),
//     writeRegister: useCallback((address: number, value: number) => whitekonService.writeRegister(address, value), [whitekonService]),
//     readAllRegisters: useCallback(() => whitekonService.readAllRegisters(), [whitekonService]),
//   }

//   return <WhitekonContext.Provider value={value}>{children}</WhitekonContext.Provider>
// }







// contexts/whitekon-context.tsx

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { WhitekonService } from "@/lib/whitekon-service"
import { useToast } from "@/hooks/use-toast"

export interface ChartDataPoint {
  time: string;
  timestamp: number;
  brancuraMedia: number | null;
  contadorAmostras: number | null;
  brancuraOnline: number | null;
}

interface WhitekonContextType {
  isConnected: boolean
  isConnecting: boolean
  connectionParams: {
    port: string
    baudRate: string
    address: string
  } | null
  whitekonData: any,
  chartHistory: ChartDataPoint[],
  connect: (port: string, baudRate: string, address: string) => Promise<boolean>
  disconnect: () => Promise<void>
  checkConnection: () => Promise<boolean>
  readRegister: (address: number) => Promise<number | null>
  writeRegister: (address: number, value: number) => Promise<boolean>
  readAllRegisters: () => Promise<{ [key: number]: number | null }>
  clearChartHistory: () => void
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
  const [chartHistory, setChartHistory] = useState<ChartDataPoint[]>([]);

  const { toast } = useToast()
  const whitekonService = WhitekonService.getInstance()
  const ONE_HOUR_MS = 60 * 60 * 1000;

  // [FIX] - Lógica para reconexão automática
  useEffect(() => {
    const savedConnection = localStorage.getItem("whitekon-connection");
    if (savedConnection) {
      console.log("Conexão anterior encontrada, tentando reconectar...");
      const { port, baudRate, address } = JSON.parse(savedConnection);
      // Usamos um timeout para garantir que a UI possa ser renderizada antes de iniciar a conexão
      setTimeout(() => connect(port, baudRate, address), 100);
    }
  }, []); // Executa apenas uma vez na montagem do componente

  const connect = useCallback(
    async (port: string, baudRate: string, address: string): Promise<boolean> => {
      if (isConnecting) return false
      
      setIsConnecting(true)
      try {
        const success = await whitekonService.connect(port, baudRate, address)
        
        if (success) {
          setIsConnected(true)
          setConnectionParams({ port, baudRate, address })
          localStorage.setItem("whitekon-connection", JSON.stringify({ port, baudRate, address }))
          
          toast({
            title: "Dispositivo Conectado",
            description: `Conexão estabelecida em ${port} (RTU: ${address})`,
          })
          
          // Configura estado padrão do dispositivo após conectar
          await whitekonService.writeRegister(29, 0) // Modo Automático
          await whitekonService.writeRegister(0, 0)  // Modo Normal
          await whitekonService.writeRegister(28, 0)  // Desliga LED/Bobina
          
          return true
        } else {
            throw new Error("Falha ao abrir a porta de comunicação.")
        }
      } catch (error: any) {
        setIsConnected(false)
        setConnectionParams(null)
        localStorage.removeItem("whitekon-connection"); // Limpa em caso de falha
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
    [isConnecting, toast, whitekonService]
  )

  const disconnect = useCallback(async (): Promise<void> => {
    await whitekonService.disconnect()
    setIsConnected(false)
    setConnectionParams(null)
    setWhitekonData(null)
    setChartHistory([])
    localStorage.removeItem("whitekon-connection")
    toast({ title: "Desconectado" })
  }, [toast, whitekonService])
  
  const checkConnection = useCallback(async (): Promise<boolean> => {
    return isConnected
  }, [isConnected])

  const clearChartHistory = useCallback(() => {
    setChartHistory([])
    toast({ title: "Histórico do gráfico limpo" })
  }, [toast])

  const filterHistoryByTime = useCallback((history: ChartDataPoint[], currentTime: number) => {
    const oneHourAgo = currentTime - ONE_HOUR_MS;
    return history.filter(entry => entry.timestamp >= oneHourAgo);
  }, [ONE_HOUR_MS]);

  useEffect(() => {
      const unsubscribe = whitekonService.onDataUpdate((data) => {
          setWhitekonData(data)
          if (data?.registers) {
              const brancuraMedia = data.registers[5];
              if (brancuraMedia !== null && brancuraMedia !== undefined) {
                  const now = new Date();
                  const timestamp = now.getTime();
                  const newHistoryEntry: ChartDataPoint = {
                      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                      timestamp,
                      brancuraMedia: brancuraMedia / 10,
                      contadorAmostras: data.registers[19],
                      brancuraOnline: data.registers[21] != null ? data.registers[21] / 10 : null,
                  };

                  setChartHistory(prevHistory => {
                      const filteredHistory = filterHistoryByTime(prevHistory, timestamp);
                      const lastEntry = filteredHistory[filteredHistory.length - 1];
                      if (lastEntry && (timestamp - lastEntry.timestamp) < 500) {
                          const newHistory = [...filteredHistory.slice(0, -1), newHistoryEntry];
                          return newHistory;
                      }
                      return [...filteredHistory, newHistoryEntry];
                  });
              }
          }
      });
      return () => unsubscribe()
  }, [whitekonService, filterHistoryByTime])

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setChartHistory(prevHistory => 
        filterHistoryByTime(prevHistory, Date.now())
      );
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, [filterHistoryByTime]);

  const value: WhitekonContextType = {
    isConnected,
    isConnecting,
    connectionParams,
    whitekonData,
    chartHistory,
    connect,
    disconnect,
    checkConnection,
    clearChartHistory,
    readRegister: useCallback((address: number) => whitekonService.readRegister(address), [whitekonService]),
    writeRegister: useCallback((address: number, value: number) => whitekonService.writeRegister(address, value), [whitekonService]),
    readAllRegisters: useCallback(() => whitekonService.readAllRegisters(), [whitekonService]),
  }

  return <WhitekonContext.Provider value={value}>{children}</WhitekonContext.Provider>
}