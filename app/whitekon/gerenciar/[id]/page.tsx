"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import { type WhiteKon, type WhiteKonData, ALARM_TYPES, INTEGRATION_TIME_CODES, GAIN_CODES } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Wifi, WifiOff, Edit, Save, X } from "lucide-react"
import { RegistersTabReal } from "@/components/registers-tab-real"
import { DashboardTab } from "@/components/dashboard-tab"
import { ConnectionTab } from "@/components/connection-tab"

export default function GerenciarWhiteKonPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [device, setDevice] = useState<WhiteKon | null>(null)
  const [data, setData] = useState<WhiteKonData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState<Partial<WhiteKonData>>({})
  const [debugMode, setDebugMode] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [ledStatus, setLedStatus] = useState(false)
  const [bobinStatus, setBobinStatus] = useState(false)
  const [activeWhitekon, setActiveWhitekon] = useState(4)
  const [isLoading, setIsLoading] = useState(false)

  // Adicionar após as outras funções de estado
  const [parametersLoaded, setParametersLoaded] = useState(false)
  const [calibrationMode, setCalibrationMode] = useState(false)

  useEffect(() => {
    if (params.id) {
      const loadedDevice = WhiteKonStorage.getById(params.id as string)
      if (loadedDevice) {
        setDevice(loadedDevice)
        setIsConnected(loadedDevice.isConnected)
        setActiveWhitekon(loadedDevice.rtuAddress)
      } else {
        toast({
          title: "Dispositivo não encontrado",
          description: "O WhiteKon solicitado não foi encontrado",
          variant: "destructive",
        })
        router.push("/whitekon/lista")
      }
    }
  }, [params.id, router, toast])

  const simulateData = () => {
    // Simula dados realísticos para demonstração
    const simulatedData: WhiteKonData = {
      brancuraMedia: 75.2,
      brancuraOnline: 74.8,
      brancuraSemCorrecao: 74.5,
      desvPadrao: 0.8,
      tempCalibracao: 28.5,
      tempOnline: 29.2,
      red: 2850,
      green: 3200,
      blue: 3050,
      clear: 9500,
      bluePreto: 1200,
      blueBranco: 8500,
      contadorAmostras: 7,
      alarmes: 0,
      modoOperacao: 0,
      tempoLedDesligado: 100,
      tempoLedLigado: 200,
      valorEscuroPadrao: 1000,
      valorClaroPadrao: 9000,
      offset: 0,
      brancuraMinima: 60.0,
      brancuraMaxima: 90.0,
      escuroMaximo: 3000,
      claroMinimo: 4000,
      coefATempA: 0.001,
      coefATempB: 0.5,
      coefATempC: 25.0,
      coefACorrecaoA: 0.002,
      coefACorrecaoB: 1.0,
      coefACorrecaoC: 0.0,
      tempoIntegracao: 1,
      ganho: 0,
      controleRemoto: 1,
      automaticoManual: 0,
    }
    setData(simulatedData)
  }

  const handleConnect = async () => {
    if (!device) return

    setIsConnecting(true)
    try {
      // Simula conexão
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const updatedDevice = WhiteKonStorage.update(device.id, {
        isConnected: true,
        lastConnection: new Date(),
      })

      if (updatedDevice) {
        setDevice(updatedDevice)
        setIsConnected(true)
        simulateData()
        toast({
          title: "Conectado",
          description: `Conectado ao ${device.name} com sucesso`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao dispositivo",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    if (!device) return

    const updatedDevice = WhiteKonStorage.update(device.id, {
      isConnected: false,
    })

    if (updatedDevice) {
      setDevice(updatedDevice)
      setIsConnected(false)
      setData(null)
      toast({
        title: "Desconectado",
        description: `Desconectado do ${device.name}`,
      })
    }
  }

  // Função para carregar parâmetros da placa - corrigir para mostrar os valores na tela
  const loadParametersFromDevice = async () => {
    if (!isConnected) {
      toast({
        title: "Erro",
        description: "Dispositivo não conectado",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Lê os parâmetros principais da placa
      const parametersToRead = [
        { register: 48, key: "tempoLedDesligado" as keyof WhiteKonData },
        { register: 49, key: "tempoLedLigado" as keyof WhiteKonData },
        { register: 50, key: "valorEscuroPadrao" as keyof WhiteKonData },
        { register: 51, key: "valorClaroPadrao" as keyof WhiteKonData },
        { register: 52, key: "offset" as keyof WhiteKonData },
        { register: 53, key: "brancuraMinima" as keyof WhiteKonData },
        { register: 54, key: "brancuraMaxima" as keyof WhiteKonData },
        { register: 55, key: "escuroMaximo" as keyof WhiteKonData },
        { register: 56, key: "claroMinimo" as keyof WhiteKonData },
        { register: 34, key: "tempoIntegracao" as keyof WhiteKonData }, // Para tempo integração e ganho
        { register: 42, key: "coefACorrecaoA" as keyof WhiteKonData },
        { register: 44, key: "coefACorrecaoB" as keyof WhiteKonData },
        { register: 46, key: "coefACorrecaoC" as keyof WhiteKonData },
        { register: 8, key: "bluePreto" as keyof WhiteKonData },
        { register: 9, key: "blueBranco" as keyof WhiteKonData },
        { register: 0, key: "modoOperacao" as keyof WhiteKonData },
      ]

      // Inicializa com dados padrão se não existir
      const loadedData: WhiteKonData = data || {
        brancuraMedia: null,
        brancuraOnline: null,
        brancuraSemCorrecao: null,
        desvPadrao: null,
        tempCalibracao: null,
        tempOnline: null,
        red: null,
        green: null,
        blue: null,
        clear: null,
        bluePreto: null,
        blueBranco: null,
        contadorAmostras: null,
        alarmes: null,
        modoOperacao: null,
        tempoLedDesligado: null,
        tempoLedLigado: null,
        valorEscuroPadrao: null,
        valorClaroPadrao: null,
        offset: null,
        brancuraMinima: null,
        brancuraMaxima: null,
        escuroMaximo: null,
        claroMinimo: null,
        coefATempA: null,
        coefATempB: null,
        coefATempC: null,
        coefACorrecaoA: null,
        coefACorrecaoB: null,
        coefACorrecaoC: null,
        tempoIntegracao: null,
        ganho: null,
        controleRemoto: null,
        automaticoManual: null,
      }

      let successCount = 0
      const failedParams = []

      for (const param of parametersToRead) {
        try {
          console.log(`Lendo registro ${param.register} para ${param.key}...`)

          const response = await fetch(`/api/whitekon?action=read&register=${param.register}`)
          if (response.ok) {
            const result = await response.json()
            const value = result.value

            console.log(`Registro ${param.register} lido: ${value}`)

            if (value !== null && value !== undefined) {
              // Processa os valores conforme o tipo
              switch (param.key) {
                case "offset":
                  loadedData.offset = value / 10 // Converte de x10 para valor real
                  break
                case "brancuraMinima":
                  loadedData.brancuraMinima = value / 10 // Converte de x10 para valor real
                  break
                case "brancuraMaxima":
                  loadedData.brancuraMaxima = value / 10 // Converte de x10 para valor real
                  break
                case "tempoIntegracao":
                  // Registro 34 contém tempo integração (high byte) e ganho (low byte)
                  loadedData.tempoIntegracao = (value >> 8) & 0xff
                  loadedData.ganho = value & 0xff
                  console.log(`Tempo integração: ${loadedData.tempoIntegracao}, Ganho: ${loadedData.ganho}`)
                  break
                case "coefACorrecaoA":
                case "coefACorrecaoB":
                case "coefACorrecaoC":
                  loadedData[param.key] = value / 1000 // Converte de x1000 para valor real
                  break
                case "modoOperacao":
                  loadedData.modoOperacao = value
                  setCalibrationMode(value === 1)
                  setManualMode(value === 2)
                  console.log(`Modo operação: ${value} (Calibração: ${value === 1}, Manual: ${value === 2})`)
                  break
                default:
                  ;(loadedData as any)[param.key] = value
              }
              successCount++
            } else {
              console.log(`Registro ${param.register} retornou valor nulo`)
              failedParams.push(param.key)
            }
          } else {
            console.error(`Erro HTTP ao ler registro ${param.register}:`, response.status)
            failedParams.push(param.key)
          }

          // Delay entre leituras para não sobrecarregar
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Erro ao ler parâmetro ${param.key} (registro ${param.register}):`, error)
          failedParams.push(param.key)
        }
      }

      // Atualiza os dados na tela
      setData(loadedData)
      setParametersLoaded(true)

      console.log("Dados carregados:", loadedData)

      if (successCount > 0) {
        toast({
          title: "Parâmetros carregados",
          description: `${successCount} parâmetros lidos da placa com sucesso${failedParams.length > 0 ? `. Falhas: ${failedParams.length}` : ""}`,
        })
      } else {
        toast({
          title: "Erro ao carregar parâmetros",
          description: "Não foi possível ler nenhum parâmetro da placa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar parâmetros:", error)
      toast({
        title: "Erro ao carregar parâmetros",
        description: "Erro ao processar a solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para salvar todos os parâmetros
  const handleSaveAllParameters = async () => {
    if (!isConnected || !data) return

    try {
      setIsLoading(true)

      const updates = []

      // Prepara todos os parâmetros para salvamento
      if (editValues.tempoLedLigado !== undefined) {
        updates.push({ register: 49, value: editValues.tempoLedLigado, name: "Tempo LED Ligado" })
      }
      if (editValues.tempoLedDesligado !== undefined) {
        updates.push({ register: 48, value: editValues.tempoLedDesligado, name: "Tempo LED Desligado" })
      }
      if (editValues.brancuraMinima !== undefined && editValues.brancuraMinima !== null) {
        updates.push({ register: 53, value: Math.round(editValues.brancuraMinima * 10), name: "Brancura Mínima" })
      }
      if (editValues.brancuraMaxima !== undefined && editValues.brancuraMaxima !== null) {
        updates.push({ register: 54, value: Math.round(editValues.brancuraMaxima * 10), name: "Brancura Máxima" })
      }
      if (editValues.offset !== undefined && editValues.offset !== null) {
        updates.push({ register: 52, value: Math.round(editValues.offset * 10), name: "Offset" })
      }

      // Tempo de integração e ganho (registro combinado 34)
      if (editValues.tempoIntegracao !== undefined || editValues.ganho !== undefined) {
        const currentTime = editValues.tempoIntegracao ?? data.tempoIntegracao ?? 0
        const currentGain = editValues.ganho ?? data.ganho ?? 0
        const combinedValue = (currentTime << 8) | currentGain
        updates.push({ register: 34, value: combinedValue, name: "Tempo Integração e Ganho" })
      }

      // Coeficientes de correção de brancura
      if (editValues.coefACorrecaoA !== undefined && editValues.coefACorrecaoA !== null) {
        updates.push({ register: 42, value: Math.round(editValues.coefACorrecaoA * 1000), name: "BRA.X²" })
      }
      if (editValues.coefACorrecaoB !== undefined && editValues.coefACorrecaoB !== null) {
        updates.push({ register: 44, value: Math.round(editValues.coefACorrecaoB * 1000), name: "BRA.X" })
      }
      if (editValues.coefACorrecaoC !== undefined && editValues.coefACorrecaoC !== null) {
        updates.push({ register: 46, value: Math.round(editValues.coefACorrecaoC * 1000), name: "BRA.C" })
      }

      // Executa todas as atualizações
      let successCount = 0
      const failedUpdates = []

      for (const update of updates) {
        try {
          const response = await fetch("/api/whitekon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ register: update.register, value: update.value }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              successCount++
              console.log(`✓ ${update.name} atualizado`)
            } else {
              failedUpdates.push(update.name)
            }
          } else {
            failedUpdates.push(update.name)
          }
        } catch (error) {
          console.error(`✗ Erro ao atualizar ${update.name}:`, error)
          failedUpdates.push(update.name)
        }
      }

      if (successCount === updates.length) {
        // Todos os parâmetros foram salvos com sucesso
        setData({ ...data, ...editValues })
        setEditValues({})
        setIsEditing(false)

        toast({
          title: "Parâmetros salvos",
          description: `Todos os ${successCount} parâmetros foram salvos com sucesso`,
        })
      } else if (successCount > 0) {
        // Alguns parâmetros foram salvos
        setData({ ...data, ...editValues })
        setEditValues({})
        setIsEditing(false)

        toast({
          title: "Parâmetros parcialmente salvos",
          description: `${successCount}/${updates.length} parâmetros salvos. Falhas: ${failedUpdates.join(", ")}`,
          variant: "destructive",
        })
      } else {
        // Nenhum parâmetro foi salvo
        toast({
          title: "Erro ao salvar parâmetros",
          description: "Não foi possível salvar nenhum parâmetro",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar parâmetros:", error)
      toast({
        title: "Erro ao salvar",
        description: "Erro ao processar a solicitação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para alternar modo de calibração
  const handleCalibrationModeToggle = async (enabled: boolean) => {
    try {
      setIsLoading(true)

      // Escreve no registro 0 (MODO_OPERACAO)
      const newMode = enabled ? 1 : 0 // 1 = Calibração, 0 = Normal
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ register: 0, value: newMode }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCalibrationMode(enabled)
          toast({
            title: enabled ? "Modo Calibração Ativado" : "Modo Normal Ativado",
            description: `Modo de operação alterado para ${enabled ? "calibração" : "normal"}`,
          })
        } else {
          throw new Error("Falha na escrita")
        }
      } else {
        throw new Error("Erro na comunicação")
      }
    } catch (error) {
      console.error("Erro ao alterar modo de calibração:", error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o modo de operação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar função handleCalibrate para usar o registro 27
  const handleCalibrate = async (type: "dark" | "light") => {
    if (!isConnected || !calibrationMode) {
      toast({
        title: "Modo de calibração inativo",
        description: "Ative o modo de calibração antes de calibrar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Comando de calibração conforme tabela Modbus - registro 27
      const command = type === "dark" ? 0x5501 : 0x5502

      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ register: 27, value: command }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast({
            title: "Calibração iniciada",
            description: `Comando de calibração ${type === "dark" ? "escuro" : "claro"} enviado. Aguarde a conclusão.`,
          })

          // Aguarda e verifica os valores atualizados
          setTimeout(async () => {
            try {
              await loadParametersFromDevice() // Recarrega todos os parâmetros
            } catch (error) {
              console.error("Erro ao verificar calibração:", error)
            }
          }, 3000)
        }
      } else {
        throw new Error("Falha na comunicação")
      }
    } catch (error) {
      console.error("Erro na calibração:", error)
      toast({
        title: "Erro na calibração",
        description: `Não foi possível iniciar a calibração ${type === "dark" ? "escuro" : "claro"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDebugCommand = async (command: "led" | "bobina", value: boolean) => {
    if (!isConnected || !manualMode) return

    try {
      setIsLoading(true)

      // Lê o valor atual do registro 28 (CONTROLE REMOTO)
      const currentResponse = await fetch("/api/whitekon?action=read&register=28")
      let currentValue = 0

      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        currentValue = currentData.value || 0
      }

      // Calcula o novo valor baseado no bit correspondente
      let newValue = currentValue
      if (command === "led") {
        // bit0 = LED
        if (value) {
          newValue = currentValue | 1 // Liga o bit 0
        } else {
          newValue = currentValue & ~1 // Desliga o bit 0
        }
      } else if (command === "bobina") {
        // bit1 = BOBINA
        if (value) {
          newValue = currentValue | 2 // Liga o bit 1
        } else {
          newValue = currentValue & ~2 // Desliga o bit 1
        }
      }

      // Escreve o novo valor no registro 28
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ register: 28, value: newValue }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Atualiza o estado local
          if (command === "led") {
            setLedStatus(value)
          } else if (command === "bobina") {
            setBobinStatus(value)
          }

          toast({
            title: "Comando executado",
            description:
              command === "led" ? `LED ${value ? "ligado" : "desligado"}` : `BOBINA ${value ? "ligada" : "desligada"}`,
          })
        } else {
          throw new Error("Falha na escrita")
        }
      } else {
        throw new Error("Erro na comunicação")
      }
    } catch (error) {
      console.error("Erro no comando:", error)
      toast({
        title: "Erro no comando",
        description: `Não foi possível ${value ? "ligar" : "desligar"} ${command === "led" ? "o LED" : "a BOBINA"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getActiveAlarms = () => {
    if (!data || !data.alarmes) return []

    return ALARM_TYPES.filter((alarm) => (data.alarmes! & (1 << alarm.bit)) !== 0)
  }

  // Server Actions para as props
  const onConnectionChangeAction = (connected: boolean) => {
    setIsConnected(connected)
  }

  const onWhitekonChangeAction = (id: number) => {
    setActiveWhitekon(id)
  }

  // Adicionar useEffect para carregar parâmetros quando conectar
  useEffect(() => {
    if (isConnected && !parametersLoaded) {
      loadParametersFromDevice()
    }
  }, [isConnected])

  if (!device) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando dispositivo...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <p className="text-gray-600">
            RTU: {device.rtuAddress} | {device.machineName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
          <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Conectado" : "Desconectado"}</Badge>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="calibration">Calibração</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="registers">Registradores</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab activeWhitekon={activeWhitekon} onWhitekonChangeAction={onWhitekonChangeAction} />
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <ConnectionTab onConnectionChangeAction={onConnectionChangeAction} />
        </TabsContent>

        <TabsContent value="parameters" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parâmetros de Leitura</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={loadParametersFromDevice}
                  variant="outline"
                  size="sm"
                  disabled={!isConnected || isLoading}
                >
                  Carregar da Placa
                </Button>
                <Button
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false)
                      setEditValues({})
                    } else {
                      setIsEditing(true)
                      // Carrega valores atuais para edição
                      if (data) {
                        setEditValues({
                          tempoLedLigado: data.tempoLedLigado,
                          tempoLedDesligado: data.tempoLedDesligado,
                          tempoIntegracao: data.tempoIntegracao,
                          ganho: data.ganho,
                          brancuraMinima: data.brancuraMinima,
                          brancuraMaxima: data.brancuraMaxima,
                          offset: data.offset,
                          coefACorrecaoA: data.coefACorrecaoA,
                          coefACorrecaoB: data.coefACorrecaoB,
                          coefACorrecaoC: data.coefACorrecaoC,
                        })
                      }
                    }
                  }}
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Tempos */}
                <div className="space-y-4">
                  <h3 className="font-medium">Tempos</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Tempo LED Ligado (ms):</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={editValues.tempoLedLigado ?? data?.tempoLedLigado ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              tempoLedLigado: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.tempoLedLigado ?? "---"}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Tempo LED Desligado (ms):</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          className="w-24"
                          value={editValues.tempoLedDesligado ?? data?.tempoLedDesligado ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              tempoLedDesligado: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.tempoLedDesligado ?? "---"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div className="space-y-4">
                  <h3 className="font-medium">Configurações</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Tempo Integração:</Label>
                      {isEditing ? (
                        <Select
                          value={String(editValues.tempoIntegracao ?? data?.tempoIntegracao ?? 0)}
                          onValueChange={(value) =>
                            setEditValues({
                              ...editValues,
                              tempoIntegracao: Number.parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INTEGRATION_TIME_CODES.map((code) => (
                              <SelectItem key={code.code} value={String(code.code)}>
                                {code.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>
                          {INTEGRATION_TIME_CODES.find((c) => c.code === data?.tempoIntegracao)?.value ?? "---"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Ganho:</Label>
                      {isEditing ? (
                        <Select
                          value={String(editValues.ganho ?? data?.ganho ?? 0)}
                          onValueChange={(value) =>
                            setEditValues({
                              ...editValues,
                              ganho: Number.parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GAIN_CODES.map((code) => (
                              <SelectItem key={code.code} value={String(code.code)}>
                                {code.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{GAIN_CODES.find((c) => c.code === data?.ganho)?.value ?? "---"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Limites */}
                <div className="space-y-4">
                  <h3 className="font-medium">Limites de Brancura</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Brancura Mínima (%):</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          className="w-24"
                          value={editValues.brancuraMinima ?? data?.brancuraMinima ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              brancuraMinima: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.brancuraMinima?.toFixed(1) ?? "---"}%</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Brancura Máxima (%):</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          className="w-24"
                          value={editValues.brancuraMaxima ?? data?.brancuraMaxima ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              brancuraMaxima: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.brancuraMaxima?.toFixed(1) ?? "---"}%</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Offset */}
                <div className="space-y-4">
                  <h3 className="font-medium">Correções</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Offset:</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          className="w-24"
                          value={editValues.offset ?? data?.offset ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              offset: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.offset?.toFixed(1) ?? "---"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Novos campos de correção de brancura */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-medium">Coeficientes de Correção de Brancura</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex items-center justify-between">
                      <Label>BRA.X²:</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.001"
                          className="w-24"
                          value={editValues.coefACorrecaoA ?? data?.coefACorrecaoA ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              coefACorrecaoA: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.coefACorrecaoA?.toFixed(3) ?? "---"}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>BRA.X:</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.001"
                          className="w-24"
                          value={editValues.coefACorrecaoB ?? data?.coefACorrecaoB ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              coefACorrecaoB: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.coefACorrecaoB?.toFixed(3) ?? "---"}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>BRA.C:</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.001"
                          className="w-24"
                          value={editValues.coefACorrecaoC ?? data?.coefACorrecaoC ?? 0}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              coefACorrecaoC: Number.parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span>{data?.coefACorrecaoC?.toFixed(3) ?? "---"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveAllParameters}
                    className="bg-[#00A651] hover:bg-[#008a43] text-white"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Todos os Parâmetros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calibration" className="space-y-6">
          <Card>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="calibration-mode" className="text-base font-medium">
                    Modo de Calibração:
                  </Label>
                  <p className="text-sm text-gray-500">Ativa o modo de calibração (Registro 0 = 1)</p>
                </div>
                <Switch
                  id="calibration-mode"
                  checked={calibrationMode}
                  onCheckedChange={handleCalibrationModeToggle}
                  disabled={!isConnected || isLoading}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Padrões de Calibração</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Valor Escuro Padrão:</span>
                      <span>{data?.valorEscuroPadrao ?? "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Claro Padrão:</span>
                      <span>{data?.valorClaroPadrao ?? "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escuro Máximo:</span>
                      <span>{data?.escuroMaximo ?? "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Claro Mínimo:</span>
                      <span>{data?.claroMinimo ?? "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blue Preto (Calibrado):</span>
                      <span className="font-mono">{data?.bluePreto ?? "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blue Branco (Calibrado):</span>
                      <span className="font-mono">{data?.blueBranco ?? "---"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Comandos de Calibração</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleCalibrate("dark")}
                      variant="outline"
                      className="w-full"
                      disabled={!isConnected || !calibrationMode || isLoading}
                    >
                      Calibrar Escuro (0x5501)
                    </Button>
                    <Button
                      onClick={() => handleCalibrate("light")}
                      variant="outline"
                      className="w-full"
                      disabled={!isConnected || !calibrationMode || isLoading}
                    >
                      Calibrar Claro (0x5502)
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Instruções:</strong>
                      <br />
                      1. Ative o modo de calibração usando o switch acima
                      <br />
                      2. Posicione o padrão escuro e clique em "Calibrar Escuro"
                      <br />
                      3. Posicione o padrão claro e clique em "Calibrar Claro"
                      <br />
                      4. Aguarde a confirmação de cada calibração
                    </p>
                  </div>

                  <div className="text-center">
                    <Badge
                      variant={calibrationMode ? "default" : "secondary"}
                      className={calibrationMode ? "bg-green-500" : ""}
                    >
                      {calibrationMode ? "MODO CALIBRAÇÃO ATIVO" : "MODO NORMAL"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="debug-mode" className="text-base font-medium">
                    Debug Habilitado:
                  </Label>
                  <p className="text-sm text-gray-500">Ativa o modo de debug para controles manuais</p>
                </div>
                <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} disabled={!isConnected} />
              </div>

              {debugMode && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div>
                      <Label htmlFor="manual-mode" className="text-base font-medium">
                        Modo Manual:
                      </Label>
                      <p className="text-sm text-gray-500">Altera modo de operação para Manual (Registro 0 = 2)</p>
                    </div>
                    <Switch
                      id="manual-mode"
                      checked={manualMode}
                      onCheckedChange={async (checked) => {
                        try {
                          setIsLoading(true)

                          // Escreve no registro 0 (MODO_OPERACAO) - 2 = Manual, 0 = Normal
                          const newMode = checked ? 2 : 0
                          console.log(`Alterando modo de operação para: ${newMode} (${checked ? "Manual" : "Normal"})`)

                          const response = await fetch("/api/whitekon", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ register: 0, value: newMode }),
                          })

                          if (response.ok) {
                            const result = await response.json()
                            if (result.success) {
                              setManualMode(checked)

                              // Atualiza o estado dos dados também
                              if (data) {
                                setData({ ...data, modoOperacao: newMode })
                              }

                              toast({
                                title: checked ? "Modo Manual Ativado" : "Modo Normal Ativado",
                                description: `Modo de operação alterado para ${checked ? "Manual (2)" : "Normal (0)"}`,
                              })
                            } else {
                              throw new Error("Falha na escrita")
                            }
                          } else {
                            throw new Error("Erro na comunicação")
                          }
                        } catch (error) {
                          console.error("Erro ao alterar modo:", error)
                          toast({
                            title: "Erro",
                            description: "Não foi possível alterar o modo de operação",
                            variant: "destructive",
                          })
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      disabled={!isConnected || isLoading}
                    />
                  </div>

                  {manualMode && (
                    <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                      <div className="mb-4">
                        <h4 className="font-medium text-blue-800">Controles Manuais Ativos</h4>
                        <p className="text-sm text-blue-600">Modo de operação: Manual (2)</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Controle LED (Registro 28, bit 0):</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={ledStatus ? "default" : "outline"}
                              onClick={() => handleDebugCommand("led", true)}
                              className={ledStatus ? "bg-green-500 hover:bg-green-600" : ""}
                              disabled={isLoading}
                            >
                              Ligar LED
                            </Button>
                            <Button
                              size="sm"
                              variant={!ledStatus ? "default" : "outline"}
                              onClick={() => handleDebugCommand("led", false)}
                              className={!ledStatus ? "bg-red-500 hover:bg-red-600" : ""}
                              disabled={isLoading}
                            >
                              Desligar LED
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Controle Bobina (Registro 28, bit 1):</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={bobinStatus ? "default" : "outline"}
                              onClick={() => handleDebugCommand("bobina", true)}
                              className={bobinStatus ? "bg-green-500 hover:bg-green-600" : ""}
                              disabled={isLoading}
                            >
                              Acionar Bobina
                            </Button>
                            <Button
                              size="sm"
                              variant={!bobinStatus ? "default" : "outline"}
                              onClick={() => handleDebugCommand("bobina", false)}
                              className={!bobinStatus ? "bg-red-500 hover:bg-red-600" : ""}
                              disabled={isLoading}
                            >
                              Desligar Bobina
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3 mt-6">
                        <div className="text-center">
                          <Label>LED Status:</Label>
                          <div
                            className={`w-6 h-6 rounded-full mx-auto mt-2 border-2 ${
                              ledStatus ? "bg-green-500 border-green-600" : "bg-gray-300 border-gray-400"
                            }`}
                          ></div>
                          <p className="text-xs mt-1">{ledStatus ? "LIGADO" : "DESLIGADO"}</p>
                        </div>
                        <div className="text-center">
                          <Label>Bobina Status:</Label>
                          <div
                            className={`w-6 h-6 rounded-full mx-auto mt-2 border-2 ${
                              bobinStatus ? "bg-blue-500 border-blue-600" : "bg-gray-300 border-gray-400"
                            }`}
                          ></div>
                          <p className="text-xs mt-1">{bobinStatus ? "ACIONADA" : "DESLIGADA"}</p>
                        </div>
                        <div className="text-center">
                          <Label>Modo Atual:</Label>
                          <Badge variant="destructive" className="mt-2 bg-orange-500">
                            MANUAL (2)
                          </Badge>
                          <p className="text-xs mt-1">Controle manual ativo</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!debugMode && (
                <div className="text-center py-8 text-gray-500">
                  <p>Ative o Debug para acessar os controles manuais</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registers" className="space-y-6">
          <RegistersTabReal deviceId={device.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
