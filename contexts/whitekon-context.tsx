"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { Mutex } from "async-mutex"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import * as WhitekonService from "@/lib/whitekon-service"
import { useToast } from "@/hooks/use-toast"
import type { WhiteKonData } from "@/lib/types"

// --- Tipos de Prioridade de Polling ---
export type PollingPriority = 
  | { mode: 'global' }
  | { mode: 'high-frequency'; deviceId: string; registers: number[]; interval: number }
  | { mode: 'paused' };

export interface ChartDataPoint {
  time: string;
  timestamp: number;
  brancuraMedia: number | null;
  contadorAmostras: number | null;
  brancuraOnline: number | null;
}

interface WhitekonContextType {
  isConnected: boolean;
  isConnecting: boolean;
  isPolling: boolean;
  connectionParams: { port: string; baudRate: string } | null;
  allDevicesData: Map<string, Partial<WhiteKonData & { error: boolean }>>;
  chartHistory: Map<string, ChartDataPoint[]>;
  connectionHealth: {
    lastSuccess: Date | null;
    consecutiveErrors: number;
    isHealthy: boolean;
  };
  setPollingPriority: (priority: PollingPriority) => void;
  connect: (port: string, baudRate: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  readDeviceRegister: (deviceId: string, register: number) => Promise<number | null>;
  writeDeviceRegister: (deviceId: string, register: number, value: number) => Promise<boolean>;
  readAllDeviceRegisters: (deviceId: string) => Promise<void>;
  clearChartHistory: (deviceId: string) => void;
}

const WhitekonContext = createContext<WhitekonContextType | undefined>(undefined);

export function useWhitekon() {
  const context = useContext(WhitekonContext)
  if (context === undefined) {
    throw new Error("useWhitekon must be used within a WhitekonProvider")
  }
  return context
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const GLOBAL_POLLING_INTERVAL = 2000;
const MAX_CONSECUTIVE_ERRORS = 5;
const communicationMutex = new Mutex();

export function WhitekonProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [connection, setConnection] = useState<{ port: string; baudRate: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  const [allDevicesData, setAllDevicesData] = useState<Map<string, Partial<WhiteKonData & { error: boolean }>>>(new Map());
  const [chartHistory, setChartHistory] = useState<Map<string, ChartDataPoint[]>>(new Map());
  const [connectionHealth, setConnectionHealth] = useState({
      lastSuccess: null as Date | null,
      consecutiveErrors: 0,
      isHealthy: true
  });
  
  const [pollingPriority, setPollingPriority] = useState<PollingPriority>({ mode: 'global' });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const previousPriorityRef = useRef<PollingPriority>({ mode: 'global' });

  const updateConnectionHealth = useCallback((success: boolean) => {
      setConnectionHealth(prev => {
        const newConsecutiveErrors = success ? 0 : prev.consecutiveErrors + 1;
        const isHealthy = newConsecutiveErrors < MAX_CONSECUTIVE_ERRORS;
        if (!isHealthy && prev.isHealthy) {
            toast({ title: "Conexão Instável", variant: "destructive" });
        }
        return {
            lastSuccess: success ? new Date() : prev.lastSuccess,
            consecutiveErrors: newConsecutiveErrors,
            isHealthy
        };
      });
  }, [toast]);

  const stopPolling = useCallback(() => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      setIsPolling(false);
  }, []);

  useEffect(() => {
    stopPolling();

    if (!isConnected || !connection) {
      return;
    }

    const { port, baudRate } = connection;
    let isMounted = true;

    const pollGlobal = async () => {
        if (communicationMutex.isLocked() || !isMounted) return;

        await communicationMutex.runExclusive(async () => {
            const devices = WhiteKonStorage.getAll();
            if (devices.length === 0) return;

            let anySuccessInCycle = false;
            const newDeviceDataUpdates = new Map<string, Partial<WhiteKonData & { error: boolean }>>();
            const newChartHistoryUpdates = new Map<string, ChartDataPoint[]>();

            for (const device of devices) {
                if (pollingPriority.mode !== 'global' || !isMounted) break;

                try {
                    const registers = await WhitekonService.readAllRegisters(
                        { port, baudrate: Number(baudRate), unit: device.rtuAddress },
                        { timeout: 1800 } 
                    );

                    anySuccessInCycle = true;
                    newDeviceDataUpdates.set(device.id, { registers, error: false });

                    const { 5: brancuraMedia, 19: contadorAmostras, 21: brancuraOnlineRaw } = registers;
                    if (brancuraMedia != null) {
                        const now = new Date();
                        const newEntry: ChartDataPoint = {
                            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            timestamp: now.getTime(),
                            brancuraMedia: brancuraMedia / 10,
                            contadorAmostras: contadorAmostras != null ? contadorAmostras + 1 : null,
                            brancuraOnline: brancuraOnlineRaw != null ? brancuraOnlineRaw / 10 : null,
                        };
                        newChartHistoryUpdates.set(device.id, [newEntry]);
                    }
                } catch (error: any) {
                    console.error(`Falha no polling do dispositivo ${device.name} (${device.id}):`, error.message);
                    newDeviceDataUpdates.set(device.id, { error: true });
                }
            }

            if (!isMounted || pollingPriority.mode !== 'global') return;

            setAllDevicesData(prevData => {
                const newMap = new Map(prevData);
                newDeviceDataUpdates.forEach((value, key) => {
                    const existing = newMap.get(key) || {};
                    newMap.set(key, { ...existing, ...value });
                });
                return newMap;
            });

            setChartHistory(prevHistory => {
                const newMap = new Map(prevHistory);
                newChartHistoryUpdates.forEach((value, key) => {
                    const currentHistory = newMap.get(key) || [];
                    const oneHourAgo = Date.now() - ONE_HOUR_MS;
                    const filteredHistory = currentHistory.filter(p => p.timestamp >= oneHourAgo);
                    newMap.set(key, [...filteredHistory, ...value]);
                });
                return newMap;
            });

            updateConnectionHealth(anySuccessInCycle);
        });
    };

    const pollHighFrequency = async (deviceId: string, registersToRead: number[]) => {
        if (communicationMutex.isLocked() || !isMounted) return;
    
        await communicationMutex.runExclusive(async () => {
            const device = WhiteKonStorage.getById(deviceId);
            if (!device) return;
    
            // Objeto temporário para guardar os valores lidos neste ciclo
            const newRegisterValues: { [key: number]: number | null } = {};
    
            // Loop sequencial para ler um registrador de cada vez
            for (const reg of registersToRead) {
                // Se o modo de prioridade mudou no meio do loop, interrompe.
                if (pollingPriority.mode !== 'high-frequency') break;
                
                try {
                    const value = await WhitekonService.readRegister(
                        { port, baudrate: Number(baudRate), unit: device.rtuAddress },
                        reg,
                        { timeout: 350 } // Timeout um pouco menor que o intervalo do loop
                    );
                    newRegisterValues[reg] = value;
                } catch (error) {
                    console.error(`Falha no polling de alta frequência para o registrador ${reg}:`, error);
                    newRegisterValues[reg] = null; // Marca como nulo em caso de falha
                }
            }
    
            // Atualiza o estado principal UMA VEZ com todos os valores coletados
            setAllDevicesData(prevData => {
                const newMap = new Map(prevData);
                const currentDeviceData = newMap.get(deviceId) || { registers: {}, error: false };
                // Mescla os registros antigos com os novos valores lidos para não apagar os outros
                const newRegisters = { ...(currentDeviceData.registers || {}), ...newRegisterValues };
                newMap.set(deviceId, { ...currentDeviceData, registers: newRegisters, error: false });
                return newMap;
            });
        });
    };
    
    let loop: () => void;
    let interval: number;

    switch (pollingPriority.mode) {
        case 'global':
            loop = pollGlobal;
            interval = GLOBAL_POLLING_INTERVAL;
            break;
        case 'high-frequency':
            loop = () => pollHighFrequency(pollingPriority.deviceId, pollingPriority.registers);
            interval = pollingPriority.interval;
            break;
        case 'paused':
        default:
            return;
    }
    
    setIsPolling(true);
    const runLoop = async () => {
        if (!isMounted || pollingPriority.mode === 'paused') {
            setIsPolling(false);
            return;
        };
        await loop();
        if (isMounted) {
            pollingRef.current = setTimeout(runLoop, interval);
        }
    }
    runLoop();

    return () => { isMounted = false; stopPolling(); };
  }, [isConnected, connection, pollingPriority, stopPolling, updateConnectionHealth]);

  const runPrioritizedAction = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    previousPriorityRef.current = pollingPriority;
    setPollingPriority({ mode: 'paused' });

    try {
      return await communicationMutex.runExclusive(action);
    } finally {
      setPollingPriority(previousPriorityRef.current);
    }
  }, [pollingPriority]);

  const connect = useCallback(async (port: string, baudRate: string): Promise<boolean> => {
    if (isConnecting || isConnected) return false;
    setIsConnecting(true);
    try {
        const devices = WhiteKonStorage.getAll();
        if (devices.length === 0) {
            toast({ title: "Nenhum dispositivo cadastrado", variant: "destructive" });
            return false;
        }
        await WhitekonService.testConnection({ port, baudrate: Number(baudRate), unit: devices[0].rtuAddress }, { timeout: 8000 });
        setConnection({ port, baudRate });
        setIsConnected(true);
        updateConnectionHealth(true);
        toast({ title: "Conectado!", description: `Conexão estabelecida na porta ${port}` });
        localStorage.setItem("whitekon-connection", JSON.stringify({ port, baudRate }));
        setPollingPriority({ mode: 'global' });
        return true;
    } catch (error: any) {
        setIsConnected(false);
        setConnection(null);
        toast({ title: "Erro de conexão", description: error.message, variant: "destructive" });
        return false;
    } finally {
        setIsConnecting(false);
    }
  }, [isConnecting, isConnected, updateConnectionHealth, toast]);

  const disconnect = useCallback(async () => {
    stopPolling();
    setIsConnected(false);
    setConnection(null);
    setAllDevicesData(new Map());
    setChartHistory(new Map());
    setConnectionHealth({ lastSuccess: null, consecutiveErrors: 0, isHealthy: true });
    localStorage.removeItem("whitekon-connection");
    toast({ title: "Desconectado" });
  }, [stopPolling, toast]);
  
  useEffect(() => {
    const saved = localStorage.getItem("whitekon-connection");
    if (saved && !isConnected && !isConnecting) {
        try {
            const { port, baudRate } = JSON.parse(saved);
            setTimeout(() => connect(port, baudRate), 1000);
        } catch (error) {
            console.error("Erro ao fazer reconexão automática:", error);
            localStorage.removeItem("whitekon-connection");
        }
    }
  }, [connect, isConnected, isConnecting]);

  const readDeviceRegister = useCallback(async (deviceId: string, register: number) => {
    if (!connection) throw new Error("Não conectado");
    const device = WhiteKonStorage.getById(deviceId);
    if (!device) throw new Error("Dispositivo não encontrado");

    return runPrioritizedAction(() => 
        WhitekonService.readRegister(
            { ...connection, baudrate: Number(connection.baudRate), unit: device.rtuAddress },
            register,
            { timeout: 4000 }
        )
    );
  }, [connection, runPrioritizedAction]);

  const writeDeviceRegister = useCallback(async (deviceId: string, register: number, value: number) => {
    if (!connection) throw new Error("Não conectado");
    const device = WhiteKonStorage.getById(deviceId);
    if (!device) throw new Error("Dispositivo não encontrado");

    return runPrioritizedAction(async () => {
        const success = await WhitekonService.writeRegister(
            { ...connection, baudrate: Number(connection.baudRate), unit: device.rtuAddress },
            register,
            value,
            { timeout: 5000 }
        );
        if (success) {
            setAllDevicesData(prev => {
                const newMap = new Map(prev);
                const currentData = newMap.get(deviceId) || { registers: {} };
                const updatedRegisters = { ...(currentData.registers || {}), [register]: value };
                newMap.set(deviceId, { ...currentData, registers: updatedRegisters, error: false });
                return newMap;
            });
        }
        return success;
    });
  }, [connection, runPrioritizedAction]);

  const readAllDeviceRegisters = useCallback(async (deviceId: string) => {
    if (!connection) throw new Error("Não conectado");
    const device = WhiteKonStorage.getById(deviceId);
    if (!device) throw new Error("Dispositivo não encontrado");
    
    await runPrioritizedAction(async () => {
        const data = await WhitekonService.readAllRegisters(
            { ...connection, baudrate: Number(connection.baudRate), unit: device.rtuAddress },
            { timeout: 6000 }
        );
        setAllDevicesData(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(deviceId, { registers: data, error: false });
            return newMap;
        });
    });
  }, [connection, runPrioritizedAction]);

  const clearChartHistory = useCallback((deviceId: string) => {
    setChartHistory(prev => {
        const newMap = new Map(prev);
        newMap.set(deviceId, []);
        return newMap;
    });
    toast({ title: "Histórico do Gráfico Limpo" });
  }, [toast]);
  
  const value: WhitekonContextType = {
      isConnected, 
      isConnecting, 
      isPolling, 
      connectionParams: connection, 
      allDevicesData, 
      chartHistory,
      connectionHealth,
      setPollingPriority,
      connect, 
      disconnect, 
      readDeviceRegister, 
      writeDeviceRegister, 
      readAllDeviceRegisters,
      clearChartHistory, 
  };

  return <WhitekonContext.Provider value={value}>{children}</WhitekonContext.Provider>;
}