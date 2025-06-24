// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/hooks/use-toast"

// interface RegistersTabProps {
//   whitekonId: number
// }

// // Modificar para ler registros reais
// export function RegistersTab({ whitekonId }: RegistersTabProps) {
//   const [registers, setRegisters] = useState<Array<{ address: number; value: string }>>([])
//   const [editingRegister, setEditingRegister] = useState<number | null>(null)
//   const [editValue, setEditValue] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()

//   // Inicializa os registradores com valores vazios
//   useEffect(() => {
//     const initialRegisters = Array.from({ length: 57 }, (_, i) => ({
//       address: i,
//       value: "---",
//     }))
//     setRegisters(initialRegisters)
//   }, [])

//   // Função para ler um registro específico
//   const handleReadRegister = async (address: number) => {
//     setIsLoading(true)
//     try {
//       // Chama a API para ler o registro específico
//       const response = await fetch(`/api/whitekon?action=data&register=${address}`)

//       if (!response.ok) {
//         throw new Error(`Erro ao ler registro ${address}`)
//       }

//       const data = await response.json()

//       if (data.error) {
//         throw new Error(data.error)
//       }

//       // Extrai o valor do registro da resposta
//       const value = data.value !== undefined ? data.value.toString() : "---"

//       // Atualiza o valor do registro na lista
//       setRegisters((prev) => prev.map((reg) => (reg.address === address ? { ...reg, value } : reg)))

//       toast({
//         title: "Registro lido",
//         description: `Registro ${address} lido com sucesso`,
//       })
//     } catch (error) {
//       console.error(`Erro ao ler registro ${address}:`, error)
//       toast({
//         title: "Erro na leitura",
//         description: `Não foi possível ler o registro ${address}`,
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Função para iniciar a edição de um registro
//   const handleStartEdit = (address: number, currentValue: string) => {
//     setEditingRegister(address)
//     setEditValue(currentValue !== "---" ? currentValue : "")
//   }

//   // Função para salvar o valor editado
//   const handleSaveEdit = async () => {
//     if (editingRegister === null) return

//     setIsLoading(true)
//     try {
//       // Converte o valor para número
//       const numericValue = Number(editValue)

//       if (isNaN(numericValue)) {
//         throw new Error("Valor inválido")
//       }

//       // Chama a API para escrever no registro
//       const response = await fetch("/api/whitekon", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ register: editingRegister, value: numericValue }),
//       })

//       if (!response.ok) {
//         throw new Error(`Erro ao escrever no registro ${editingRegister}`)
//       }

//       const result = await response.json()

//       if (!result.success) {
//         throw new Error(result.error || "Falha na escrita")
//       }

//       // Atualiza o valor do registro na lista
//       setRegisters((prev) => prev.map((reg) => (reg.address === editingRegister ? { ...reg, value: editValue } : reg)))

//       toast({
//         title: "Registro atualizado",
//         description: `Registro ${editingRegister} atualizado com sucesso`,
//       })

//       // Limpa o estado de edição
//       setEditingRegister(null)
//       setEditValue("")
//     } catch (error) {
//       console.error(`Erro ao escrever no registro ${editingRegister}:`, error)
//       toast({
//         title: "Erro na escrita",
//         description: `Não foi possível atualizar o registro ${editingRegister}`,
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Função para cancelar a edição
//   const handleCancelEdit = () => {
//     setEditingRegister(null)
//     setEditValue("")
//   }

//   // Função para ler todos os registros
//   const handleReadAllRegisters = async () => {
//     setIsLoading(true)
//     try {
//       // Lê os registros em blocos para não sobrecarregar
//       const readBlock = async (start: number, count: number) => {
//         const response = await fetch(`/api/whitekon?action=data&register=${start}&count=${count}`)

//         if (!response.ok) {
//           throw new Error(`Erro ao ler registros ${start}-${start + count - 1}`)
//         }

//         const data = await response.json()

//         if (data.error) {
//           throw new Error(data.error)
//         }

//         return data.values || []
//       }

//       // Lê os registros em blocos de 10
//       const totalRegisters = 57
//       const blockSize = 10
//       const updatedRegisters = [...registers]

//       for (let i = 0; i < totalRegisters; i += blockSize) {
//         const count = Math.min(blockSize, totalRegisters - i)
//         const values = await readBlock(i, count)

//         for (let j = 0; j < values.length; j++) {
//           if (i + j < updatedRegisters.length) {
//             updatedRegisters[i + j].value = values[j].toString()
//           }
//         }
//       }

//       setRegisters(updatedRegisters)

//       toast({
//         title: "Registros lidos",
//         description: "Todos os registros foram lidos com sucesso",
//       })
//     } catch (error) {
//       console.error("Erro ao ler todos os registros:", error)
//       toast({
//         title: "Erro na leitura",
//         description: "Não foi possível ler todos os registros",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle>Registradores - WhiteKon #{whitekonId}</CardTitle>
//         <Button
//           onClick={handleReadAllRegisters}
//           className="bg-[#00A651] hover:bg-[#008a43] text-white"
//           disabled={isLoading}
//         >
//           {isLoading ? "Carregando..." : "Ler Todos"}
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Endereço</TableHead>
//                 <TableHead>Valor</TableHead>
//                 <TableHead className="w-[100px]">Ações</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {registers.slice(0, 29).map((register) => (
//                 <TableRow key={register.address}>
//                   <TableCell className="font-medium text-blue-600">ENDEREÇO {register.address}</TableCell>
//                   <TableCell>
//                     {editingRegister === register.address ? (
//                       <Input
//                         value={editValue}
//                         onChange={(e) => setEditValue(e.target.value)}
//                         className="bg-slate-800 text-white"
//                       />
//                     ) : (
//                       register.value
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {editingRegister === register.address ? (
//                       <div className="flex space-x-1">
//                         <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>
//                           Salvar
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
//                           Cancelar
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="flex space-x-1">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleReadRegister(register.address)}
//                           disabled={isLoading}
//                         >
//                           Ler
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleStartEdit(register.address, register.value)}
//                           disabled={isLoading}
//                         >
//                           Editar
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Endereço</TableHead>
//                 <TableHead>Valor</TableHead>
//                 <TableHead className="w-[100px]">Ações</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {registers.slice(29).map((register) => (
//                 <TableRow key={register.address}>
//                   <TableCell className="font-medium text-blue-600">ENDEREÇO {register.address}</TableCell>
//                   <TableCell>
//                     {editingRegister === register.address ? (
//                       <Input
//                         value={editValue}
//                         onChange={(e) => setEditValue(e.target.value)}
//                         className="bg-slate-800 text-white"
//                       />
//                     ) : (
//                       register.value
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {editingRegister === register.address ? (
//                       <div className="flex space-x-1">
//                         <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>
//                           Salvar
//                         </Button>
//                         <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
//                           Cancelar
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="flex space-x-1">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleReadRegister(register.address)}
//                           disabled={isLoading}
//                         >
//                           Ler
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleStartEdit(register.address, register.value)}
//                           disabled={isLoading}
//                         >
//                           Editar
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }






"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { WhitekonService } from "@/lib/whitekon-service"
import { useWhitekon } from "@/contexts/whitekon-context"
import { Loader2, RefreshCw } from "lucide-react"

interface RegisterInfo {
  address: number
  name: string
  description: string
  category: string
  rw: "R" | "W" | "R/W"
  type: string
  unit?: string
  range?: string
}

const REGISTER_INFO: RegisterInfo[] = [
    // ... (mantenha a sua lista de registros igual)
    { address: 0, name: "MODO DE OPERAÇÃO", description: "0-Normal, 1-Calibração, 2-Limpeza", category: "BANCO DE DADOS R/W", rw: "R/W", type: "UINT16" },
    { address: 5, name: "BRANCURA MÉDIA", description: "Valor final da média da brancura", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: "% (x10)" },
    { address: 6, name: "TEMP. CALIBRAÇÃO", description: "Temperatura no momento da calibração", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: "°C (x10)" },
    { address: 7, name: "TEMP. ONLINE", description: "Temperatura online, no momento", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: "°C (x10)" },
    { address: 8, name: "BLUE PRETO", description: "Valor do blue calibrado no escuro", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
    { address: 9, name: "BLUE BRANCO", description: "Valor do blue calibrado no claro", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
    { address: 10, name: "ALARMES", description: "Alarmes indicados pelo Whitekon", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
    { address: 11, name: "DESVIO PADRÃO", description: "Valor do desvio padrão da última média", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: "% (x100)" },
    { address: 15, name: "RED", description: "Valor do R do sensor RGB", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
    { address: 16, name: "GREEN", description: "Valor do G do sensor RGB", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
    { address: 17, name: "BLUE", description: "Valor do B do sensor RGB", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
    { address: 18, name: "CLEAR", description: "Valor do Clear", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
    { address: 19, name: "CONTADOR DE AMOSTRAS", description: "Mostra em qual amostra está da amostragem", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
    { address: 20, name: "BRANCURA S/ CORREÇÃO", description: "Brancura sem correção de temperatura", category: "READ ONLINE ONLY", rw: "R", type: "UINT16", unit: "% (x10)" },
    { address: 21, name: "BRANCURA ONLINE", description: "Brancura com correção online", category: "READ ONLINE ONLY", rw: "R", type: "UINT16", unit: "% (x10)" },
    { address: 27, name: "COMANDOS CALIBRAÇÃO", description: "0x5501 Calibra Escuro; 0x5502 Calibra Claro", category: "WRITE CALIBRATE", rw: "W", type: "UINT16" },
    { address: 28, name: "CONTROLE REMOTO", description: "bit0 = LED; bit1 = BOBINA", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
    { address: 29, name: "AUTOMÁTICO/MANUAL", description: "Acionamento dos leds e bobina", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
    { address: 33, name: "END.RTU", description: "Endereço RTU", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
    { address: 34, name: "TEMPO INTEGRAÇÃO E GANHO", description: "High: Tempo Integração; Low: Ganho", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16" },
    { address: 48, name: "TEMPO LED DESLIGADO", description: "Tempo em que os leds permanecem desligados", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: "ms" },
    { address: 49, name: "TEMPO LED LIGADO", description: "Tempo em que os leds permanecem ligados", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: "ms" },
    { address: 50, name: "VALOR ESCURO PADRÃO", description: "Valor do padrão escuro para calibração", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16" },
    { address: 51, name: "VALOR CLARO PADRÃO", description: "Valor do padrão claro para calibração", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16" },
    { address: 52, name: "OFFSET", description: "Offset de brancura", category: "WRITE ONLINE ONLY", rw: "R/W", type: "INT16", unit: "x10" },
    { address: 53, name: "BRANCURA MÍNIMA", description: "Valor mínimo aceitável de brancura", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: "% (x10)" },
    { address: 54, name: "BRANCURA MÁXIMA", description: "Valor máximo aceitável de brancura", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: "% (x10)" },
    { address: 55, name: "ESCURO MÁXIMO", description: "Valor de blue máximo na calibração de escuro", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16" },
    { address: 56, name: "CLARO MÍNIMO", description: "Valor de blue mínimo na calibração de claro", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16" },
]


interface RegistersTabRealProps {
  deviceId: string
}

export function RegistersTabReal({ deviceId }: RegistersTabRealProps) {
  const [registers, setRegisters] = useState<{ [key: number]: number | null }>({})
  const [editingRegister, setEditingRegister] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { isConnected } = useWhitekon()
  const whitekonService = WhitekonService.getInstance()

  const handleReadRegister = async (address: number) => {
    if (!isConnected) return toast({ title: "Erro", description: "Dispositivo não conectado", variant: "destructive" });
    setIsLoading(true);
    try {
      const value = await whitekonService.readRegister(address);
      setRegisters((prev) => ({ ...prev, [address]: value }));
      toast({ title: "Registro lido", description: `Registro ${address}: ${value}` });
    } catch (error: any) {
      toast({ title: "Erro na leitura", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAllRegisters = async () => {
    if (!isConnected) return toast({ title: "Erro", description: "Dispositivo não conectado", variant: "destructive" });
    setIsLoading(true);
    try {
      toast({ title: "Lendo registros", description: "Iniciando leitura completa..." });
      const allRegisters = await whitekonService.readAllRegisters();
      setRegisters(allRegisters);
      const readCount = Object.values(allRegisters).filter((v) => v !== null).length;
      toast({ title: "Leitura concluída", description: `${readCount} registros lidos.` });
    } catch (error: any) {
      toast({ title: "Erro na leitura", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (address: number, currentValue: number | null) => {
    const registerInfo = REGISTER_INFO.find((r) => r.address === address);
    if (registerInfo?.rw === "R") return toast({ title: "Somente Leitura", variant: "destructive" });
    setEditingRegister(address);
    setEditValue(currentValue !== null ? currentValue.toString() : "");
  };

  const handleSaveEdit = async () => {
    if (editingRegister === null || !isConnected) return;
    setIsLoading(true);
    try {
      const numericValue = Number.parseInt(editValue);
      if (isNaN(numericValue)) throw new Error("Valor inválido");

      const success = await whitekonService.writeRegister(editingRegister, numericValue);
      if (success) {
        setRegisters((prev) => ({ ...prev, [editingRegister]: numericValue }));
        setEditingRegister(null);
        setEditValue("");
        toast({ title: "Registro atualizado", description: `Registro ${editingRegister} salvo como ${numericValue}` });
      } else {
        throw new Error("Falha na escrita");
      }
    } catch (error: any) {
      toast({ title: "Erro na escrita", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRegister(null);
    setEditValue("");
  };
  
  const getCategoryColor = (category: string) => {
    // ... (função mantida)
  }

  const renderRegisterValue = (address: number, value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return "---";
    }
    // Trata o caso específico do registrador 6
    if (address === 6 && value === 65535) {
      return "---";
    }
    return value.toString();
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Dispositivo não conectado</h3>
            <p className="text-gray-500">Vá para a aba "Conexão" para conectar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    REGISTER_INFO.slice(0, Math.ceil(REGISTER_INFO.length / 2)),
    REGISTER_INFO.slice(Math.ceil(REGISTER_INFO.length / 2)),
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registradores Modbus</CardTitle>
        <Button onClick={handleReadAllRegisters} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Ler Todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-2">
              {column.map((registerInfo) => {
                const currentValue = registers[registerInfo.address];
                const displayValue = renderRegisterValue(registerInfo.address, currentValue);

                return (
                  <div key={registerInfo.address} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-600">REG {registerInfo.address}</span>
                        <Badge variant="outline">{registerInfo.rw}</Badge>
                      </div>
                      <p className="text-sm font-medium">{registerInfo.name}</p>
                      <p className="text-xs text-gray-500">{registerInfo.description}</p>
                    </div>
                    <div className="flex items-center gap-2 min-w-[220px]">
                      {editingRegister === registerInfo.address ? (
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} type="number" className="h-8"/>
                      ) : (
                        <div className={`text-center font-mono text-sm p-1 rounded w-full ${currentValue !== null && currentValue !== undefined && displayValue !== "---" ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
                          {displayValue}
                        </div>
                      )}
                      <div className="flex gap-1">
                        {editingRegister === registerInfo.address ? (
                          <>
                            <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>Salvar</Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>X</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleReadRegister(registerInfo.address)} disabled={isLoading}>Ler</Button>
                            {registerInfo.rw !== "R" && (
                              <Button size="sm" variant="outline" onClick={() => handleStartEdit(registerInfo.address, currentValue)} disabled={isLoading}>Editar</Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}