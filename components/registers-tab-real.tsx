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
  {
    address: 0,
    name: "MODO DE OPERAÇÃO",
    description: "0-Normal, 1-Calibração, 2-Limpeza, 3-Máquina Parada",
    category: "BANCO DE DADOS R/W",
    rw: "R/W",
    type: "UINT16",
    range: "0-3",
  },
  {
    address: 1,
    name: "RESERVADO",
    description: "Reservado",
    category: "BANCO DE DADOS R/W",
    rw: "R/W",
    type: "UINT16",
  },
  {
    address: 2,
    name: "RESERVADO",
    description: "Reservado",
    category: "BANCO DE DADOS R/W",
    rw: "R/W",
    type: "UINT16",
  },
  {
    address: 3,
    name: "RESERVADO",
    description: "Reservado",
    category: "BANCO DE DADOS R/W",
    rw: "R/W",
    type: "UINT16",
  },
  {
    address: 4,
    name: "RESERVADO",
    description: "Reservado",
    category: "BANCO DE DADOS R/W",
    rw: "R/W",
    type: "UINT16",
  },
  {
    address: 5,
    name: "BRANCURA MÉDIA",
    description: "Valor final da média da brancura descontando desvio padrão",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
    unit: "% (x10)",
  },
  {
    address: 6,
    name: "TEMP. CALIBRAÇÃO",
    description: "Temperatura no momento da calibração",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
    unit: "°C (x10)",
  },
  {
    address: 7,
    name: "TEMP. ONLINE",
    description: "Temperatura online, no momento",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
    unit: "°C (x10)",
  },
  {
    address: 8,
    name: "BLUE PRETO",
    description: "Valor do blue quando calibrado o padrão escuro",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 9,
    name: "BLUE BRANCO",
    description: "Valor do blue quando calibrado o padrão claro",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 10,
    name: "ALARMES",
    description: "Alarmes indicados pelo Whitekon",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 11,
    name: "DESVIO PADRÃO",
    description: "Valor do desvio padrão da última média",
    category: "BANCO DE DADOS R",
    rw: "R",
    type: "UINT16",
    unit: "% (x100)",
  },
  { address: 12, name: "RESERVADO", description: "Reservado", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
  { address: 13, name: "RESERVADO", description: "Reservado", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
  { address: 14, name: "RESERVADO", description: "Reservado", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
  {
    address: 15,
    name: "RED",
    description: "Valor do R do sensor RGB",
    category: "READ ONLINE ONLY",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 16,
    name: "GREEN",
    description: "Valor do G do sensor RGB",
    category: "READ ONLINE ONLY",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 17,
    name: "BLUE",
    description: "Valor do B do sensor RGB",
    category: "READ ONLINE ONLY",
    rw: "R",
    type: "UINT16",
  },
  { address: 18, name: "CLEAR", description: "Valor do Clear", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
  {
    address: 19,
    name: "CONTADOR DE AMOSTRAS",
    description: "Mostra em qual amostra está da amostragem",
    category: "READ ONLINE ONLY",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 20,
    name: "BRANCURA S/ CORREÇÃO",
    description: "Brancura sem correção de temperatura ou coeficientes",
    category: "READ ONLINE ONLY",
    rw: "R",
    type: "UINT16",
    unit: "% (x10)",
  },
  {
    address: 21,
    name: "BRANCURA ONLINE",
    description: "Brancura com correção online",
    category: "READ ONLINE ONLY",
    rw: "R",
    type: "UINT16",
    unit: "% (x10)",
  },
  { address: 22, name: "RESERVADO", description: "Reservado", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
  { address: 23, name: "RESERVADO", description: "Reservado", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
  { address: 24, name: "RESERVADO", description: "Reservado", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
  { address: 25, name: "RESERVADO", description: "Reservado", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
  { address: 26, name: "RESERVADO", description: "Reservado", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
  {
    address: 27,
    name: "COMANDOS CALIBRAÇÃO",
    description: "0x5501 Calibra Escuro; 0x5502 Calibra Claro",
    category: "WRITE CALIBRATE",
    rw: "R/W",
    type: "UINT16",
  },
  {
    address: 28,
    name: "CONTROLE REMOTO",
    description: "bit0 = LED; bit1 = BOBINA",
    category: "WRITE DEBUG",
    rw: "R/W",
    type: "UINT16",
    range: "0-1",
  },
  {
    address: 29,
    name: "AUTOMÁTICO/MANUAL",
    description: "Acionamento dos leds e bobina",
    category: "WRITE DEBUG",
    rw: "R/W",
    type: "UINT16",
    range: "0-1",
  },
  { address: 30, name: "RESERVADO", description: "Reservado", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
  { address: 31, name: "RESERVADO", description: "Reservado", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
  { address: 32, name: "RESERVADO", description: "Reservado", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
  { address: 33, name: "END.RTU", description: "Endereço RTU", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
  {
    address: 34,
    name: "TEMPO INTEGRAÇÃO E GANHO",
    description: "High: Tempo de Integração; Low: Ganho",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    range: "0-5 / 0-3",
  },
  {
    address: 35,
    name: "CONFIGURAÇÕES GERAIS",
    description: "Utilizado apenas os primeiros 8 bits",
    category: "WRITE ONLINE ONLY",
    rw: "R",
    type: "UINT16",
  },
  {
    address: 36,
    name: "COEF. A TEMPERATURA (HIGH)",
    description: "Correção de temperatura (x²)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 37,
    name: "COEF. A TEMPERATURA (LOW)",
    description: "Correção de temperatura (x²)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 38,
    name: "COEF. B TEMPERATURA (HIGH)",
    description: "Correção de temperatura (x)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 39,
    name: "COEF. B TEMPERATURA (LOW)",
    description: "Correção de temperatura (x)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 40,
    name: "COEF. C TEMPERATURA (HIGH)",
    description: "Correção de temperatura (c)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 41,
    name: "COEF. C TEMPERATURA (LOW)",
    description: "Correção de temperatura (c)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 42,
    name: "COEF. A CORREÇÃO (HIGH)",
    description: "Correção de brancura (x²)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 43,
    name: "COEF. A CORREÇÃO (LOW)",
    description: "Correção de brancura (x²)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 44,
    name: "COEF. B CORREÇÃO (HIGH)",
    description: "Correção de brancura (x)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 45,
    name: "COEF. B CORREÇÃO (LOW)",
    description: "Correção de brancura (x)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 46,
    name: "COEF. C CORREÇÃO (HIGH)",
    description: "Correção de brancura (c)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 47,
    name: "COEF. C CORREÇÃO (LOW)",
    description: "Correção de brancura (c)",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "FLOAT32",
  },
  {
    address: 48,
    name: "TEMPO LED DESLIGADO",
    description: "Tempo em que os leds permanecem desligados",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    unit: "ms",
    range: "0-65280",
  },
  {
    address: 49,
    name: "TEMPO LED LIGADO",
    description: "Tempo em que os leds permanecem ligados",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    unit: "ms",
    range: "0-65280",
  },
  {
    address: 50,
    name: "VALOR ESCURO PADRÃO",
    description: "Valor do padrão escuro para calibração",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    unit: "% (x10)",
    range: "0-65280",
  },
  {
    address: 51,
    name: "VALOR CLARO PADRÃO",
    description: "Valor do padrão claro para calibração",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    unit: "% (x10)",
    range: "0-65280",
  },
  {
    address: 52,
    name: "OFFSET",
    description: "Offset de brancura",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "INT16",
    unit: "x10",
    range: "(-32768)-(32767)",
  },
  {
    address: 53,
    name: "BRANCURA MÍNIMA",
    description: "Valor mínimo aceitável de brancura",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    unit: "% (x10)",
    range: "0-65280",
  },
  {
    address: 54,
    name: "BRANCURA MÁXIMA",
    description: "Valor máximo aceitável de brancura",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    unit: "% (x10)",
    range: "0-65280",
  },
  {
    address: 55,
    name: "ESCURO MÁXIMO",
    description: "Valor de blue máximo que pode dar na calibração de escuro",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    range: "0-65280",
  },
  {
    address: 56,
    name: "CLARO MÍNIMO",
    description: "Valor de blue mínimo que pode dar na calibração de claro",
    category: "WRITE ONLINE ONLY",
    rw: "R/W",
    type: "UINT16",
    range: "0-65280",
  },
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
  const { isConnected, whitekonData } = useWhitekon()
  const whitekonService = WhitekonService.getInstance()

  useEffect(() => {
    // Atualiza registros com dados do contexto (preserva dados existentes)
    if (whitekonData?.registers) {
      setRegisters((prev) => ({ ...prev, ...whitekonData.registers }))
    }
  }, [whitekonData])

  const handleReadRegister = async (address: number) => {
    if (!isConnected) {
      toast({
        title: "Erro",
        description: "Dispositivo não conectado",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const value = await whitekonService.readRegister(address)

      // Atualiza apenas este registro específico
      setRegisters((prev) => ({ ...prev, [address]: value }))

      toast({
        title: "Registro lido",
        description: `Registro ${address} lido com sucesso: ${value}`,
      })
    } catch (error: any) {
      console.error(`Erro ao ler registro ${address}:`, error)
      toast({
        title: "Erro na leitura",
        description: error.message || `Não foi possível ler o registro ${address}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReadAllRegisters = async () => {
    if (!isConnected) {
      toast({
        title: "Erro",
        description: "Dispositivo não conectado",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      toast({
        title: "Lendo registros",
        description: "Iniciando leitura de todos os registros...",
      })

      const allRegisters = await whitekonService.readAllRegisters()

      // Preserva dados existentes e adiciona os novos
      setRegisters((prev) => ({ ...prev, ...allRegisters }))

      const readCount = Object.values(allRegisters).filter((v) => v !== null).length
      toast({
        title: "Leitura concluída",
        description: `${readCount} registros lidos com sucesso`,
      })
    } catch (error: any) {
      console.error("Erro ao ler todos os registros:", error)
      toast({
        title: "Erro na leitura",
        description: error.message || "Erro ao ler os registros",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartEdit = (address: number, currentValue: number | null) => {
    const registerInfo = REGISTER_INFO.find((r) => r.address === address)
    if (registerInfo?.rw === "R") {
      toast({
        title: "Registro somente leitura",
        description: "Este registro não pode ser editado",
        variant: "destructive",
      })
      return
    }

    setEditingRegister(address)
    setEditValue(currentValue !== null ? currentValue.toString() : "")
  }

  const handleSaveEdit = async () => {
    if (editingRegister === null || !isConnected) return

    setIsLoading(true)
    try {
      const numericValue = Number.parseInt(editValue)

      if (isNaN(numericValue)) {
        throw new Error("Valor inválido")
      }

      const success = await whitekonService.writeRegister(editingRegister, numericValue)

      if (success) {
        // Atualiza o valor local
        setRegisters((prev) => ({ ...prev, [editingRegister]: numericValue }))
        setEditingRegister(null)
        setEditValue("")

        toast({
          title: "Registro atualizado",
          description: `Registro ${editingRegister} atualizado para ${numericValue}`,
        })
      } else {
        throw new Error("Falha na escrita")
      }
    } catch (error: any) {
      console.error(`Erro ao escrever no registro ${editingRegister}:`, error)
      toast({
        title: "Erro na escrita",
        description: error.message || `Não foi possível atualizar o registro ${editingRegister}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingRegister(null)
    setEditValue("")
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "BANCO DE DADOS R/W":
        return "bg-blue-100 text-blue-800"
      case "BANCO DE DADOS R":
        return "bg-green-100 text-green-800"
      case "READ ONLINE ONLY":
        return "bg-yellow-100 text-yellow-800"
      case "WRITE CALIBRATE":
        return "bg-purple-100 text-purple-800"
      case "WRITE DEBUG":
        return "bg-red-100 text-red-800"
      case "WRITE ONLINE ONLY":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Dispositivo não conectado</h3>
            <p className="text-gray-500">Conecte o dispositivo para visualizar os registros</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const registersWithData = Object.keys(registers).length
  const registersWithValues = Object.values(registers).filter((v) => v !== null).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Registradores Modbus - WhiteKon</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {registersWithValues} de {registersWithData} registros com dados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReadAllRegisters}
            disabled={isLoading}
            className="bg-[#00A651] hover:bg-[#008a43] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lendo...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Ler Todos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primeira coluna */}
          <div className="space-y-2">
            {REGISTER_INFO.slice(0, Math.ceil(REGISTER_INFO.length / 2)).map((registerInfo) => (
              <div
                key={registerInfo.address}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-blue-600">ENDEREÇO {registerInfo.address}</span>
                    <Badge variant="outline" className={getCategoryColor(registerInfo.category)}>
                      {registerInfo.rw}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{registerInfo.name}</div>
                    <div className="text-xs">{registerInfo.description}</div>
                    {registerInfo.unit && <div className="text-xs text-gray-500">Unidade: {registerInfo.unit}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                  <div className="flex-1">
                    {editingRegister === registerInfo.address ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                        type="number"
                      />
                    ) : (
                      <div
                        className={`text-center font-mono text-sm p-1 rounded ${
                          registers[registerInfo.address] !== undefined && registers[registerInfo.address] !== null
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }`}
                      >
                        {registers[registerInfo.address] !== undefined && registers[registerInfo.address] !== null
                          ? registers[registerInfo.address]
                          : "---"}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editingRegister === registerInfo.address ? (
                      <>
                        <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReadRegister(registerInfo.address)}
                          disabled={isLoading}
                        >
                          Ler
                        </Button>
                        {registerInfo.rw !== "R" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(registerInfo.address, registers[registerInfo.address])}
                            disabled={isLoading}
                          >
                            Editar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Segunda coluna */}
          <div className="space-y-2">
            {REGISTER_INFO.slice(Math.ceil(REGISTER_INFO.length / 2)).map((registerInfo) => (
              <div
                key={registerInfo.address}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-blue-600">ENDEREÇO {registerInfo.address}</span>
                    <Badge variant="outline" className={getCategoryColor(registerInfo.category)}>
                      {registerInfo.rw}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{registerInfo.name}</div>
                    <div className="text-xs">{registerInfo.description}</div>
                    {registerInfo.unit && <div className="text-xs text-gray-500">Unidade: {registerInfo.unit}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                  <div className="flex-1">
                    {editingRegister === registerInfo.address ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 text-sm"
                        type="number"
                      />
                    ) : (
                      <div
                        className={`text-center font-mono text-sm p-1 rounded ${
                          registers[registerInfo.address] !== undefined && registers[registerInfo.address] !== null
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100"
                        }`}
                      >
                        {registers[registerInfo.address] !== undefined && registers[registerInfo.address] !== null
                          ? registers[registerInfo.address]
                          : "---"}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editingRegister === registerInfo.address ? (
                      <>
                        <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReadRegister(registerInfo.address)}
                          disabled={isLoading}
                        >
                          Ler
                        </Button>
                        {registerInfo.rw !== "R" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(registerInfo.address, registers[registerInfo.address])}
                            disabled={isLoading}
                          >
                            Editar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}





// // ygor0508/whitekon/Whitekon-c54b456e05a3382899bc7e184d713d759dc04091/components/registers-tab-real.tsx
// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/hooks/use-toast"
// import { WhitekonService } from "@/lib/whitekon-service"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { Loader2, RefreshCw } from "lucide-react"

// interface RegisterInfo {
//   address: number
//   name: string
//   description: string
//   category: string
//   rw: "R" | "W" | "R/W"
//   type: string
//   unit?: string
//   range?: string
// }

// const REGISTER_INFO: RegisterInfo[] = [
//     { address: 0, name: "MODO DE OPERAÇÃO", description: "0-Normal, 1-Calibração, 2-Limpeza, 3-Máquina Parada", category: "BANCO DE DADOS R/W", rw: "R/W", type: "UINT16", range: '0-3' },
//     { address: 5, name: "BRANCURA MÉDIA", description: "Valor final da média da brancura descontando desvio padrão", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: '% (x10)' },
//     { address: 6, name: "TEMP. CALIBRAÇÃO", description: "Temperatura no momento da calibração", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: '°C (x10)' },
//     { address: 7, name: "TEMP. ONLINE", description: "Temperatura online, no momento", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: '°C (x10)' },
//     { address: 8, name: "BLUE PRETO", description: "Valor do blue quando calibrado o padrão escuro", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
//     { address: 9, name: "BLUE BRANCO", description: "Valor do blue quando calibrado o padrão claro", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
//     { address: 10, name: "ALARMES", description: "Alarmes indicados pelo Whitekon", category: "BANCO DE DADOS R", rw: "R", type: "UINT16" },
//     { address: 11, name: "DESVIO PADRÃO", description: "Valor do desvio padrão da última média", category: "BANCO DE DADOS R", rw: "R", type: "UINT16", unit: '% (x100)' },
//     { address: 15, name: "RED", description: "Valor do R do sensor RGB", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
//     { address: 16, name: "GREEN", description: "Valor do G do sensor RGB", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
//     { address: 17, name: "BLUE", description: "Valor do B do sensor RGB", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
//     { address: 18, name: "CLEAR", description: "Valor do Clear", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
//     { address: 19, name: "CONTADOR DE AMOSTRAS", description: "Mostra em qual amostra está da amostragem", category: "READ ONLINE ONLY", rw: "R", type: "UINT16" },
//     { address: 20, name: "BRANCURA S/ CORREÇÃO", description: "Brancura sem correção de temperatura ou coeficientes", category: "READ ONLINE ONLY", rw: "R", type: "UINT16", unit: '% (x10)' },
//     { address: 21, name: "BRANCURA ONLINE", description: "Brancura com correção online", category: "READ ONLINE ONLY", rw: "R", type: "UINT16", unit: '% (x10)' },
//     { address: 27, name: "COMANDOS CALIBRAÇÃO", description: "0x5501 Calibra Escuro; 0x5502 Calibra Claro", category: "WRITE CALIBRATE", rw: "W", type: "UINT16" },
//     { address: 28, name: "CONTROLE REMOTO", description: "bit0 = LED; bit1 = BOBINA", category: "WRITE DEBUG", rw: "R/W", type: "UINT16", range: '0-1' },
//     { address: 29, name: "AUTOMÁTICO/MANUAL", description: "Acionamento dos leds e bobina", category: "WRITE DEBUG", rw: "R/W", type: "UINT16", range: '0-1' },
//     { address: 33, name: "END.RTU", description: "Endereço RTU", category: "WRITE DEBUG", rw: "R/W", type: "UINT16" },
//     { address: 34, name: "TEMPO INTEGRAÇÃO E GANHO", description: "High: Tempo de Integração; Low: Ganho", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", range: '0-5 / 0-3' },
//     { address: 36, name: "COEF. A TEMPERATURA", description: "Correção de temperatura (x²)", category: "WRITE ONLINE ONLY", rw: "R/W", type: "FLOAT32" },
//     { address: 38, name: "COEF. B TEMPERATURA", description: "Correção de temperatura (x)", category: "WRITE ONLINE ONLY", rw: "R/W", type: "FLOAT32" },
//     { address: 40, name: "COEF. C TEMPERATURA", description: "Correção de temperatura (c)", category: "WRITE ONLINE ONLY", rw: "R/W", type: "FLOAT32" },
//     { address: 42, name: "COEF. A CORREÇÃO", description: "Correção de brancura (x²)", category: "WRITE ONLINE ONLY", rw: "R/W", type: "FLOAT32" },
//     { address: 44, name: "COEF. B CORREÇÃO", description: "Correção de brancura (x)", category: "WRITE ONLINE ONLY", rw: "R/W", type: "FLOAT32" },
//     { address: 46, name: "COEF. C CORREÇÃO", description: "Correção de brancura (c)", category: "WRITE ONLINE ONLY", rw: "R/W", type: "FLOAT32" },
//     { address: 48, name: "TEMPO LED DESLIGADO", description: "Tempo em que os leds permanecem desligados", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: 'ms', range: '0-65280' },
//     { address: 49, name: "TEMPO LED LIGADO", description: "Tempo em que os leds permanecem ligados", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: 'ms', range: '0-65280' },
//     { address: 50, name: "VALOR ESCURO PADRÃO", description: "Valor do padrão escuro para calibração", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: '% (x10)', range: '0-65280' },
//     { address: 51, name: "VALOR CLARO PADRÃO", description: "Valor do padrão claro para calibração", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: '% (x10)', range: '0-65280' },
//     { address: 52, name: "OFFSET", description: "Offset de brancura", category: "WRITE ONLINE ONLY", rw: "R/W", type: "INT16", unit: 'x10', range: '(-32768)-(32767)' },
//     { address: 53, name: "BRANCURA MÍNIMA", description: "Valor mínimo aceitável de brancura", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: '% (x10)', range: '0-65280' },
//     { address: 54, name: "BRANCURA MÁXIMA", description: "Valor máximo aceitável de brancura", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", unit: '% (x10)', range: '0-65280' },
//     { address: 55, name: "ESCURO MÁXIMO", description: "Valor de blue máximo que pode dar na calibração de escuro", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", range: '0-65280' },
//     { address: 56, name: "CLARO MÍNIMO", description: "Valor de blue mínimo que pode dar na calibração de claro", category: "WRITE ONLINE ONLY", rw: "R/W", type: "UINT16", range: '0-65280' },
// ]

// interface RegistersTabRealProps {
//   deviceId: string
// }

// export function RegistersTabReal({ deviceId }: RegistersTabRealProps) {
//   const [registers, setRegisters] = useState<{ [key: number]: number | null }>({})
//   const [floatRegisters, setFloatRegisters] = useState<{ [key: number]: number | null }>({})
//   const [editingRegister, setEditingRegister] = useState<number | null>(null)
//   const [editValue, setEditValue] = useState("")
//   const [isLoading, setIsLoading] = useState(false)

//   const { toast } = useToast()
//   const { isConnected, whitekonData } = useWhitekon()
//   const whitekonService = WhitekonService.getInstance()

//   useEffect(() => {
//     if (whitekonData?.registers) {
//       setRegisters((prev) => ({ ...prev, ...whitekonData.registers }))
//     }
//   }, [whitekonData])

//   const handleReadRegister = async (address: number, type: string) => {
//     if (!isConnected) {
//       toast({ title: "Erro", description: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }
//     setIsLoading(true);
//     try {
//       if (type === 'FLOAT32') {
//         const value = await whitekonService.readFloatRegister(address);
//         setFloatRegisters((prev) => ({ ...prev, [address]: value }));
//         toast({ title: "Registro lido", description: `Registro ${address}: ${value}` });
//       } else {
//         const value = await whitekonService.readRegister(address);
//         setRegisters((prev) => ({ ...prev, [address]: value }));
//         toast({ title: "Registro lido", description: `Registro ${address}: ${value}` });
//       }
//     } catch (error: any) {
//       toast({ title: "Erro na leitura", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReadAllRegisters = async () => {
//     if (!isConnected) return toast({ title: "Erro", description: "Dispositivo não conectado", variant: "destructive" });
//     setIsLoading(true);
//     try {
//       toast({ title: "Lendo registros", description: "Iniciando leitura completa..." });
//       const allRegisters = await whitekonService.readAllRegisters();
//       setRegisters(allRegisters);
//       const readCount = Object.values(allRegisters).filter((v) => v !== null).length;
//       toast({ title: "Leitura concluída", description: `${readCount} registros lidos.` });
//     } catch (error: any) {
//       toast({ title: "Erro na leitura", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStartEdit = (address: number, currentValue: number | null | undefined, type: string) => {
//     const registerInfo = REGISTER_INFO.find((r) => r.address === address);
//     if (registerInfo?.rw === "R") return toast({ title: "Somente Leitura", variant: "destructive" });

//     setEditingRegister(address);
//     if (type === 'FLOAT32') {
//       const floatValue = floatRegisters[address];
//       setEditValue(floatValue !== null && floatValue !== undefined ? floatValue.toString() : "");
//     } else {
//       setEditValue(currentValue !== null && currentValue !== undefined ? currentValue.toString() : "");
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (editingRegister === null || !isConnected) return;
//     setIsLoading(true);
//     const registerInfo = REGISTER_INFO.find(r => r.address === editingRegister);
//     try {
//       if (registerInfo?.type === 'FLOAT32') {
//         const numericValue = Number.parseFloat(editValue);
//         if (isNaN(numericValue)) throw new Error("Valor inválido para float");
//         const success = await whitekonService.writeFloatRegister(editingRegister, numericValue);
//         if (success) {
//           setFloatRegisters(prev => ({ ...prev, [editingRegister]: numericValue }));
//           toast({ title: "Registro atualizado", description: `Registro ${editingRegister} salvo como ${numericValue}` });
//         } else {
//           throw new Error("Falha na escrita do float");
//         }
//       } else {
//         const numericValue = Number.parseInt(editValue);
//         if (isNaN(numericValue)) throw new Error("Valor inválido");
//         const success = await whitekonService.writeRegister(editingRegister, numericValue);
//         if (success) {
//           setRegisters(prev => ({ ...prev, [editingRegister]: numericValue }));
//           toast({ title: "Registro atualizado", description: `Registro ${editingRegister} salvo como ${numericValue}` });
//         } else {
//           throw new Error("Falha na escrita");
//         }
//       }
//       setEditingRegister(null);
//       setEditValue("");
//     } catch (error: any) {
//       toast({ title: "Erro na escrita", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const handleCancelEdit = () => {
//     setEditingRegister(null);
//     setEditValue("");
//   };

//   const renderRegister = (registerInfo: RegisterInfo) => {
//     const isFloat = registerInfo.type === 'FLOAT32';
//     const currentValue = isFloat ? floatRegisters[registerInfo.address] : registers[registerInfo.address];
//     const displayValue = (currentValue !== null && currentValue !== undefined) ? (isFloat ? (currentValue as number).toExponential(3) : currentValue.toString()) : "---";

//     return (
//       <div key={registerInfo.address} className="flex items-center justify-between p-3 border rounded-lg">
//         <div className="flex-1 pr-4">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="font-medium text-blue-600">REG {registerInfo.address}</span>
//             <Badge variant="outline">{registerInfo.rw}</Badge>
//             {isFloat && <Badge variant="secondary">FLOAT32</Badge>}
//           </div>
//           <p className="text-sm font-medium">{registerInfo.name}</p>
//           <p className="text-xs text-gray-500">{registerInfo.description}</p>
//         </div>
//         <div className="flex items-center gap-2 min-w-[220px]">
//           {editingRegister === registerInfo.address ? (
//             <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} type="number" step={isFloat ? "any" : "1"} className="h-8"/>
//           ) : (
//             <div className={`text-center font-mono text-sm p-1 rounded w-full ${currentValue !== null && currentValue !== undefined ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
//               {displayValue}
//             </div>
//           )}
//           <div className="flex gap-1">
//             {editingRegister === registerInfo.address ? (
//               <>
//                 <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>Salvar</Button>
//                 <Button size="sm" variant="ghost" onClick={handleCancelEdit}>X</Button>
//               </>
//             ) : (
//               <>
//                 <Button size="sm" variant="outline" onClick={() => handleReadRegister(registerInfo.address, registerInfo.type)} disabled={isLoading}>Ler</Button>
//                 {registerInfo.rw !== "R" && (
//                   <Button size="sm" variant="outline" onClick={() => handleStartEdit(registerInfo.address, currentValue, registerInfo.type)} disabled={isLoading}>Editar</Button>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!isConnected) {
//     return (
//       <Card>
//         <CardContent className="flex flex-col items-center justify-center py-12">
//           <div className="text-center">
//             <h3 className="text-lg font-medium mb-2">Dispositivo não conectado</h3>
//             <p className="text-gray-500">Vá para a aba "Conexão" para conectar.</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const normalRegisters = REGISTER_INFO.filter(r => r.type !== 'FLOAT32');
//   const floatRegs = REGISTER_INFO.filter(r => r.type === 'FLOAT32');

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle>Registradores Modbus</CardTitle>
//         <Button onClick={handleReadAllRegisters} disabled={isLoading}>
//           {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
//           Ler Todos (Exceto Floats)
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <h3 className="font-bold text-lg mb-2">Registradores Padrão</h3>
//             {normalRegisters.slice(0, Math.ceil(normalRegisters.length / 2)).map(renderRegister)}
//           </div>
//           <div className="space-y-2">
//             <h3 className="font-bold text-lg mb-2 text-transparent">.</h3>
//             {normalRegisters.slice(Math.ceil(normalRegisters.length / 2)).map(renderRegister)}
//           </div>
//           <div className="space-y-2 lg:col-span-2">
//             <h3 className="font-bold text-lg mb-2 border-t pt-4">Registradores de Ponto Flutuante (FLOAT32)</h3>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 {floatRegs.slice(0, Math.ceil(floatRegs.length/2)).map(renderRegister)}
//               </div>
//               <div className="space-y-2">
//                 {floatRegs.slice(Math.ceil(floatRegs.length/2)).map(renderRegister)}
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }