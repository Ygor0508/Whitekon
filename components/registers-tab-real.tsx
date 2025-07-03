// components/registers-tab-real.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
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
  const [editingRegister, setEditingRegister] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { isConnected, allDevicesData, readDeviceRegister, writeDeviceRegister, readAllDeviceRegisters } = useWhitekon()
  
  const deviceData = allDevicesData.get(deviceId);
  const registers = deviceData?.registers || {};

  const handleReadRegister = async (address: number) => {
    if (!isConnected) return toast({ title: "Erro", description: "Dispositivo não conectado", variant: "destructive" });

    setIsLoading(true);
    try {
      await readDeviceRegister(deviceId, address);
      toast({ title: "Registro lido", description: `Registro ${address} lido com sucesso.` });
    } catch (error: any) {
      toast({ title: "Erro na leitura", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleReadAllRegisters = async () => {
    if (!isConnected) return toast({ title: "Erro", description: "Dispositivo não conectado", variant: "destructive" });

    setIsLoading(true);
    try {
      toast({ title: "Lendo registros", description: "Iniciando leitura completa..." });
      await readAllDeviceRegisters(deviceId);
      toast({ title: "Leitura concluída", description: `Registros do dispositivo sincronizados.` });
    } catch (error: any) {
      toast({ title: "Erro na leitura", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleStartEdit = (address: number, currentValue: number | null) => {
    const registerInfo = REGISTER_INFO.find((r) => r.address === address);
    if (registerInfo?.rw === "R") return toast({ title: "Registro somente leitura", variant: "destructive" });
    
    setEditingRegister(address);
    setEditValue(currentValue !== null ? currentValue.toString() : "");
  }

  const handleSaveEdit = async () => {
    if (editingRegister === null || !isConnected) return;
    setIsLoading(true);
    try {
      const numericValue = Number.parseInt(editValue);
      if (isNaN(numericValue)) throw new Error("Valor inválido");

      await writeDeviceRegister(deviceId, editingRegister, numericValue);
      
      setEditingRegister(null);
      setEditValue("");
      toast({ title: "Registro atualizado", description: `Registro ${editingRegister} salvo como ${numericValue}` });
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

  const renderRegister = (registerInfo: RegisterInfo) => {
    const currentValue = registers[registerInfo.address] ?? null;
    const displayValue = currentValue !== null ? currentValue.toString() : "---";

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
            <div className={`text-center font-mono text-sm p-1 rounded w-full ${currentValue !== null ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
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
    );
  }

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
              {column.map(renderRegister)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}