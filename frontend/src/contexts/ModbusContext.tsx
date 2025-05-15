// 'use client'

// import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react'

// interface ModbusContextType {
//   isConnected: boolean
//   portName: string
//   baudRate: number
//   unitId: number
//   isChecking: boolean
//   connectModbus: (port: string, baud: number, unit: number) => Promise<void>
//   disconnectModbus: () => Promise<void>
//   readRegisters: (start: number, count: number) => Promise<number[]>
//   writeRegister: (address: number, value: number) => Promise<void>
// }

// const ModbusContext = createContext<ModbusContextType | undefined>(undefined)

// export function ModbusProvider({ children }: { children: ReactNode }) {
//   const [isConnected, setIsConnected] = useState(false)
//   const [portName, setPortName] = useState('')
//   const [baudRate, setBaudRate] = useState(0)
//   const [unitId, setUnitId] = useState(0)
//   const [isChecking, setIsChecking] = useState(false)
//   const checkTimeoutRef = useRef<NodeJS.Timeout>()
//   const lastCheckRef = useRef(0)
//   const MIN_CHECK_INTERVAL = 3000 // 3 segundos entre verificações
//   const reconnectingRef = useRef(false)
//   const readRegistersRef = useRef<(start: number, count: number) => Promise<number[]>>()
//   const disconnectModbusRef = useRef<() => Promise<void>>()

//   // Função para desconectar ao fechar a aplicação
//   useEffect(() => {
//     const handleBeforeUnload = async () => {
//       if (isConnected) {
//         try {
//           await fetch('/api/modbus/disconnect', { method: 'POST' })
//         } catch (error) {
//           console.error('Erro ao desconectar:', error)
//         }
//       }
//     }

//     window.addEventListener('beforeunload', handleBeforeUnload)
    
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload)
//       // Desconecta quando o provider for desmontado
//       if (isConnected) {
//         disconnectModbus().catch(console.error)
//       }
//     }
//   }, [isConnected])

//   const connectModbus = useCallback(async (port: string, baud: number, unit: number) => {
//     try {
//       console.log('Tentando conectar com parâmetros:', { port, baud, unit });
      
//       const response = await fetch('/api/modbus/connect', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           port, 
//           baudRate: baud, 
//           unitId: unit 
//         }),
//       })

//       const data = await response.json()
      
//       if (!response.ok) {
//         console.error('Erro na resposta:', data);
//         throw new Error(data.error || 'Falha na conexão')
//       }

//       console.log('Conexão bem sucedida');
//       setPortName(port)
//       setBaudRate(baud)
//       setUnitId(unit)
//       setIsConnected(true)
      
//       // Inicia verificação de conexão
//       checkConnection()
//     } catch (error) {
//       console.error('Erro ao conectar:', error)
//       setIsConnected(false)
//       throw error
//     }
//   }, [])

//   const readRegisters = useCallback(async (start: number, count: number) => {
//     try {
//       console.log('Lendo registros:', { start, count })
//       const response = await fetch(`/api/modbus/read?start=${start}&count=${count}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       })

//       if (!response.ok) {
//         throw new Error('Falha na leitura dos registros')
//       }

//       const data = await response.json()
//       if (!data.success) {
//         throw new Error(data.error || 'Erro desconhecido na leitura')
//       }

//       return data.data
//     } catch (error: any) {
//       console.error('Erro na leitura:', error)
//       throw error
//     }
//   }, [])

//   readRegistersRef.current = readRegisters;

//   const disconnectModbus = useCallback(async () => {
//     try {
//       console.log('Desconectando...');
//       await fetch('/api/modbus/disconnect', { method: 'POST' })
//       setIsConnected(false)
      
//       if (checkTimeoutRef.current) {
//         clearTimeout(checkTimeoutRef.current)
//       }
//     } catch (error) {
//       console.error('Erro ao desconectar:', error)
//       throw error
//     }
//   }, [])

//   // Atualiza a ref quando disconnectModbus mudar
//   useEffect(() => {
//     disconnectModbusRef.current = disconnectModbus;
//   }, [disconnectModbus]);

//   const checkConnection = useCallback(async () => {
//     if (!isConnected || reconnectingRef.current || isChecking) {
//         return;
//     }
    
//     const now = Date.now();
//     if (now - lastCheckRef.current < MIN_CHECK_INTERVAL) {
//         return;
//     }

//     try {
//         setIsChecking(true);
//         lastCheckRef.current = now;

//         // Adiciona um delay antes de tentar ler
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // Tenta uma leitura de teste
//         await readRegistersRef.current?.(0, 1);
//         console.log('Conexão verificada com sucesso');
//     } catch (error) {
//         console.log('Falha na verificação, tentando reconectar...');
        
//         if (!reconnectingRef.current) {
//             reconnectingRef.current = true;
//             try {
//                 await disconnectModbusRef.current?.();
                
//                 // Aumenta o delay antes de reconectar
//                 await new Promise(resolve => setTimeout(resolve, 2000));
                
//                 await connectModbus(portName, baudRate, unitId);
//                 console.log('Reconexão bem sucedida');
//             } catch (reconnectError) {
//                 console.error('Falha na reconexão:', reconnectError);
//                 setIsConnected(false);
//             } finally {
//                 reconnectingRef.current = false;
//             }
//         }
//     } finally {
//         setIsChecking(false);
        
//         if (checkTimeoutRef.current) {
//             clearTimeout(checkTimeoutRef.current);
//         }
//         checkTimeoutRef.current = setTimeout(checkConnection, MIN_CHECK_INTERVAL);
//     }
// }, [isConnected, isChecking, portName, baudRate, unitId, connectModbus]);

//   useEffect(() => {
//     let mounted = true;
    
//     if (isConnected && mounted) {
//         console.log('Iniciando monitoramento de conexão');
//         checkConnection();
//     }
    
//     return () => {
//         mounted = false;
//         if (checkTimeoutRef.current) {
//             clearTimeout(checkTimeoutRef.current);
//         }
//     }
//   }, [isConnected, checkConnection]);

//   const writeRegister = useCallback(async (address: number, value: number) => {
//     if (!isConnected) {
//       throw new Error('Dispositivo desconectado')
//     }

//     try {
//       console.log('Escrevendo registro:', { address, value });
//       const response = await fetch('/api/modbus/write', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ address, value }),
//       })

//       const data = await response.json()
//       if (!response.ok) {
//         console.error('Erro na escrita:', data);
//         throw new Error(data.error || 'Falha na escrita')
//       }
//     } catch (error) {
//       console.error('Erro na escrita:', error)
//       // Se erro de conexão, atualiza estado
//       if (error instanceof Error && error.message.includes('desconectado')) {
//         setIsConnected(false)
//       }
//       throw error
//     }
//   }, [isConnected])

//   const value = useMemo(() => ({
//     isConnected,
//     portName,
//     baudRate,
//     unitId,
//     isChecking,
//     connectModbus,
//     disconnectModbus,
//     readRegisters,
//     writeRegister
//   }), [isConnected, portName, baudRate, unitId, isChecking, connectModbus, disconnectModbus, readRegisters, writeRegister])

//   return (
//     <ModbusContext.Provider value={value}>
//       {children}
//     </ModbusContext.Provider>
//   )
// }

// export function useModbus() {
//   const context = useContext(ModbusContext)
//   if (context === undefined) {
//     throw new Error('useModbus deve ser usado dentro de um ModbusProvider')
//   }
//   return context
// } 

//


'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
  useRef
} from 'react';

interface ModbusContextType {
  isConnected: boolean;
  portName: string;
  baudRate: number;
  unitId: number;
  isChecking: boolean;
  connectModbus: (port: string, baud: number, unit: number) => Promise<void>;
  disconnectModbus: () => Promise<void>;
  readRegisters: (start: number, count: number) => Promise<number[]>;
  writeRegister: (address: number, value: number) => Promise<void>;
}

const ModbusContext = createContext<ModbusContextType | undefined>(undefined);

export function ModbusProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [portName, setPortName] = useState('');
  const [baudRate, setBaudRate] = useState(0);
  const [unitId, setUnitId] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef(0);
  const reconnectingRef = useRef(false);
  const readRegistersRef = useRef<(s: number, c: number) => Promise<number[]>>();
  const disconnectRef = useRef<() => Promise<void>>();

  const MIN_CHECK_INTERVAL = 3000;

  //
  // 1) Funções auxiliares para rotas HTTP
  //

  const connectModbus = useCallback(
    async (port: string, baud: number, unit: number) => {
      try {
        console.log('Tentando conectar com:', { port, baud, unit });
        const resp = await fetch(
          `/api/modbus/connect?port=${encodeURIComponent(port)}&baudrate=${baud}&unit=${unit}`,
          { method: 'POST' }
        );
        const json = await resp.json();
        // Se o JSON estiver vazio ou indicar erro, utiliza mensagem padrão
        if (!resp.ok || !json.success || Object.keys(json).length === 0) {
          console.error('Connect error response:', json);
          throw new Error((json && json.error) ? json.error : 'Falha na conexão');
        }
        setPortName(port);
        setBaudRate(baud);
        setUnitId(unit);
        setIsConnected(true);
      } catch (err: any) {
        console.error('Erro ao conectar:', err);
        setIsConnected(false);
        throw err;
      }
    },
    []
  );

  const readRegisters = useCallback(
    async (start: number, count: number): Promise<number[]> => {
      try {
        console.log('Lendo registros:', { start, count });
        const resp = await fetch(
          `/api/modbus/read?start=${start}&count=${count}`,
          { method: 'GET' }
        );
        const json = await resp.json();
        if (!resp.ok || !json.success) {
          console.error('Read error response:', json);
          throw new Error(json.error || 'Falha na leitura');
        }
        return json.data as number[];
      } catch (err: any) {
        console.error('Erro na leitura:', err);
        throw err;
      }
    },
    []
  );

  const writeRegister = useCallback(
    async (address: number, value: number) => {
      if (!isConnected) throw new Error('Dispositivo desconectado');
      try {
        console.log('Escrevendo registro:', { address, value });
        const resp = await fetch('/api/modbus/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, value })
        });
        const json = await resp.json();
        if (!resp.ok || !json.success) {
          console.error('Write error response:', json);
          throw new Error(json.error || 'Falha na escrita');
        }
      } catch (err: any) {
        console.error('Erro na escrita:', err);
        if (err.message.includes('desconectado')) {
          setIsConnected(false);
        }
        throw err;
      }
    },
    [isConnected]
  );

  const disconnectModbus = useCallback(async () => {
    try {
      console.log('Desconectando Modbus...');
      const resp = await fetch('/api/modbus/disconnect', { method: 'DELETE' });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        console.error('Disconnect error response:', json);
        throw new Error(json.error || 'Falha ao desconectar');
      }
      setIsConnected(false);
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      throw err;
    }
  }, []);

  // Manter refs atualizadas para usar em checkConnection
  readRegistersRef.current = readRegisters;
  disconnectRef.current = disconnectModbus;

  //
  // 2) Verificação periódica e reconexão automática
  //
  const checkConnection = useCallback(async () => {
    if (!isConnected || reconnectingRef.current || isChecking) return;
    const now = Date.now();
    if (now - lastCheckRef.current < MIN_CHECK_INTERVAL) return;

    try {
      setIsChecking(true);
      lastCheckRef.current = now;

      // Delay antes de testar (1500ms para dar tempo à porta liberar)
      await new Promise(r => setTimeout(r, 1500));

      // Leitura de teste
      await readRegistersRef.current!(0, 1);
      console.log('Verificação bem-sucedida');
    } catch (err) {
      console.warn('Verificação falhou, reconectando...', err);
      if (!reconnectingRef.current) {
        reconnectingRef.current = true;
        try {
          await disconnectRef.current!();
          // Aguarda 3000ms para garantir que a COM8 seja liberada
          await new Promise(r => setTimeout(r, 3000));
          await connectModbus(portName, baudRate, unitId);
          console.log('Reconexão bem-sucedida');
        } catch (e) {
          console.error('Falha na reconexão:', e);
          setIsConnected(false);
        } finally {
          reconnectingRef.current = false;
        }
      }
    } finally {
      setIsChecking(false);
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = setTimeout(checkConnection, MIN_CHECK_INTERVAL);
    }
  }, [isConnected, isChecking, portName, baudRate, unitId, connectModbus]);

  // Inicia a verificação assim que houver conexão
  useEffect(() => {
    if (isConnected) {
      console.log('Iniciando monitoramento de conexão...');
      checkConnection();
    }
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [isConnected, checkConnection]);

  //
  // 3) Desconectar ao fechar a página ou desmontar o Provider
  //
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isConnected) {
        try {
          await fetch('/api/modbus/disconnect', { method: 'DELETE' });
        } catch (e) {
          console.error('Erro no beforeunload disconnect:', e);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isConnected) {
        disconnectModbus().catch(console.error);
      }
    };
  }, [isConnected, disconnectModbus]);

  //
  // 4) Provedor e hook
  //
  const value = useMemo(
    () => ({
      isConnected,
      portName,
      baudRate,
      unitId,
      isChecking,
      connectModbus,
      disconnectModbus,
      readRegisters,
      writeRegister
    }),
    [
      isConnected,
      portName,
      baudRate,
      unitId,
      isChecking,
      connectModbus,
      disconnectModbus,
      readRegisters,
      writeRegister
    ]
  );

  return (
    <ModbusContext.Provider value={value}>
      {children}
    </ModbusContext.Provider>
  );
}

export function useModbus() {
  const ctx = useContext(ModbusContext);
  if (!ctx) {
    throw new Error('useModbus deve ser usado dentro de ModbusProvider');
  }
  return ctx;
}
