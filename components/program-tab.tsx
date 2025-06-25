"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { WhitekonService } from "@/lib/whitekon-service"
import { useToast } from "@/hooks/use-toast"
import { ALARM_TYPES } from "@/lib/types"

interface ProgramTabProps {
  whitekonId: number
}

export function ProgramTab({ whitekonId }: ProgramTabProps) {
  const [calibrationActive, setCalibrationActive] = useState(false)
  const [mode, setMode] = useState("0")
  const [integrationTime, setIntegrationTime] = useState("1") // 24ms
  const [gain, setGain] = useState("0") // 1x
  const [ledStatus, setLedStatus] = useState(false)
  const [whitekonData, setWhitekonData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [calibrationAlarms, setCalibrationAlarms] = useState<any[]>([])

  const { toast } = useToast()
  const whitekonService = WhitekonService.getInstance()

  // Valores para os polinômios de correção
  const [temperatureCorrection, setTemperatureCorrection] = useState({
    a: "",
    b: "",
    c: "",
  })

  const [whitenessCorrection, setWhitenessCorrection] = useState({
    a: "",
    b: "",
    c: "",
  })

  // Valores para offset e limites
  const [offset, setOffset] = useState("")
  const [minWhiteness, setMinWhiteness] = useState("")
  const [maxWhiteness, setMaxWhiteness] = useState("")
  const [maxDark, setMaxDark] = useState("")
  const [minLight, setMinLight] = useState("")

  // Função para processar apenas os alarmes de calibração
  const processCalibrationAlarms = (alarmBits: number) => {
    const calibrationAlarmTypes = ALARM_TYPES.filter(alarm => alarm.type === "CALIBRAÇÃO")
    const newAlarms: any[] = []

    calibrationAlarmTypes.forEach(alarmType => {
      if (alarmBits & (1 << alarmType.bit)) {
        newAlarms.push({
          id: Date.now() + alarmType.bit,
          type: alarmType.description,
          bit: alarmType.bit,
          unit: whitekonId,
          time: new Date().toLocaleTimeString(),
        })
      }
    })

    setCalibrationAlarms(newAlarms)
  }

  useEffect(() => {
    const unsubscribe = whitekonService.onDataUpdate((data) => {
      if (data?.registers) {
        // Converte os registros para o formato esperado
        const convertedData = {
          rgb: {
            red: data.registers[15]?.toString() || "0",
            green: data.registers[16]?.toString() || "0",
            blue: data.registers[17]?.toString() || "0",
            clear: data.registers[18]?.toString() || "0",
          },
          brancura: {
            media: data.registers[5] ? data.registers[5] / 10 : 0,
            online: data.registers[21] ? data.registers[21] / 10 : 0,
          },
        }
        setWhitekonData(convertedData)

        // Processar alarmes de calibração usando o registro 10
        if (data.registers[10]) {
          processCalibrationAlarms(data.registers[10])
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleCalibrationToggle = async () => {
    setIsLoading(true)
    try {
      // No modo real, isso alteraria o registro MODO_OPERACAO para 1 (calibração) ou 0 (normal)
      const newMode = !calibrationActive ? 1 : 0
      const success = await whitekonService.setOperationMode(newMode)

      if (success) {
        setCalibrationActive(!calibrationActive)
        toast({
          title: !calibrationActive ? "Calibração ativada" : "Calibração desativada",
          description: !calibrationActive
            ? "Modo de calibração ativado com sucesso"
            : "Modo de operação normal restaurado",
        })
      } else {
        toast({
          title: "Falha na operação",
          description: "Não foi possível alterar o modo de operação",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar modo de calibração:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o modo de calibração",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalibrateDark = async () => {
    setIsLoading(true)
    try {
      const success = await whitekonService.calibrateDark()

      if (success) {
        toast({
          title: "Calibração de escuro",
          description: "Calibração de escuro iniciada com sucesso",
        })
      } else {
        toast({
          title: "Falha na calibração",
          description: "Não foi possível iniciar a calibração de escuro",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao calibrar escuro:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao iniciar a calibração de escuro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalibrateWhite = async () => {
    setIsLoading(true)
    try {
      const success = await whitekonService.calibrateWhite()

      if (success) {
        toast({
          title: "Calibração de claro",
          description: "Calibração de claro iniciada com sucesso",
        })
      } else {
        toast({
          title: "Falha na calibração",
          description: "Não foi possível iniciar a calibração de claro",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao calibrar claro:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao iniciar a calibração de claro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetAutoMode = async (auto: boolean) => {
    setIsLoading(true)
    try {
      const success = await whitekonService.setAutoMode(auto)

      if (success) {
        setMode(auto ? "0" : "1")
        toast({
          title: auto ? "Modo automático" : "Modo manual",
          description: `Modo ${auto ? "automático" : "manual"} ativado com sucesso`,
        })
      } else {
        toast({
          title: "Falha na operação",
          description: `Não foi possível ativar o modo ${auto ? "automático" : "manual"}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar modo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o modo de operação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetIntegrationTime = async (value: string) => {
    setIsLoading(true)
    try {
      const timeCode = Number.parseInt(value)
      const success = await whitekonService.setIntegrationTime(timeCode)

      if (success) {
        setIntegrationTime(value)
        toast({
          title: "Tempo de integração",
          description: "Tempo de integração alterado com sucesso",
        })
      } else {
        toast({
          title: "Falha na operação",
          description: "Não foi possível alterar o tempo de integração",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar tempo de integração:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o tempo de integração",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetGain = async (value: string) => {
    setIsLoading(true)
    try {
      const gainCode = Number.parseInt(value)
      const success = await whitekonService.setGain(gainCode)

      if (success) {
        setGain(value)
        toast({
          title: "Ganho",
          description: "Ganho alterado com sucesso",
        })
      } else {
        toast({
          title: "Falha na operação",
          description: "Não foi possível alterar o ganho",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar ganho:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o ganho",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetOffset = async () => {
    if (!offset) return

    setIsLoading(true)
    try {
      const offsetValue = Number.parseFloat(offset)
      const success = await whitekonService.setOffset(offsetValue)

      if (success) {
        toast({
          title: "Offset",
          description: "Offset de brancura alterado com sucesso",
        })
      } else {
        toast({
          title: "Falha na operação",
          description: "Não foi possível alterar o offset",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar offset:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o offset",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetBrightnessLimits = async () => {
    if (!minWhiteness || !maxWhiteness) return

    setIsLoading(true)
    try {
      const min = Number.parseFloat(minWhiteness)
      const max = Number.parseFloat(maxWhiteness)
      const success = await whitekonService.setBrightnessLimits(min, max)

      if (success) {
        toast({
          title: "Limites de brancura",
          description: "Limites de brancura alterados com sucesso",
        })
      } else {
        toast({
          title: "Falha na operação",
          description: "Não foi possível alterar os limites de brancura",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar limites de brancura:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar os limites de brancura",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função genérica para leitura de valores
  const handleReadValue = (field: string) => {
    toast({
      title: "Leitura de valor",
      description: `Lendo valor de ${field}...`,
    })
  }

  // Função genérica para envio de valores
  const handleSendValue = (field: string) => {
    toast({
      title: "Envio de valor",
      description: `Enviando valor de ${field}...`,
    })
  }

  // Valores RGB e brancura do WhiteKon
  const rgbValues = whitekonData?.rgb || {
    red: "0",
    green: "0",
    blue: "0",
    clear: "0",
  }

  const whitenessValues = whitekonData
    ? {
        whiteness: whitekonData.brancura.media?.toString() || "0",
        corrected: whitekonData.brancura.online?.toString() || "0",
      }
    : {
        whiteness: "0",
        corrected: "0",
      }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">WhiteKon #{whitekonId}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leituras RGB e Brancura</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label className="text-red-500 font-bold">RED</Label>
                  <span className="font-mono">{rgbValues.red}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-green-500 font-bold">GREEN</Label>
                  <span className="font-mono">{rgbValues.green}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-blue-500 font-bold">BLUE</Label>
                  <span className="font-mono">{rgbValues.blue}</span>
                </div>
                <div className="flex justify-between">
                  <Label>CLEAR</Label>
                  <span className="font-mono">{rgbValues.clear}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label className="text-yellow-500 font-bold">BRANCURA</Label>
                  <span className="font-mono">{whitenessValues.whiteness}</span>
                </div>
                <div className="flex justify-between">
                  <Label>BR S/ CORR.</Label>
                  <span className="font-mono">{whitenessValues.corrected}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calibração</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleCalibrationToggle}
                disabled={isLoading}
                className={calibrationActive ? "bg-red-500 hover:bg-red-600" : "bg-[#00A651] hover:bg-[#008a43]"}
              >
                {calibrationActive ? "DESATIVAR CALIBRAÇÃO" : "ATIVAR CALIBRAÇÃO"}
              </Button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" onClick={handleCalibrateDark} disabled={!calibrationActive || isLoading}>
                  Calibra Preto
                </Button>
                <Button variant="outline" onClick={handleCalibrateWhite} disabled={!calibrationActive || isLoading}>
                  Calibra Branco
                </Button>
              </div>

              <div className="mt-4 text-center">
                <div className="inline-block px-4 py-2 border border-yellow-500 rounded-md">
                  <span className="text-yellow-500 font-bold">
                    {calibrationActive ? "CALIBRA HABILITADO" : "CALIBRA DESABILITADO"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alarmes de Calibração</CardTitle>
          </CardHeader>
          <CardContent>
            {calibrationAlarms.length > 0 ? (
              <div className="space-y-3">
                {calibrationAlarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`p-3 border rounded-md flex justify-between items-start ${
                      alarm.bit === 6 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${
                        alarm.bit === 6 ? "text-green-800" : "text-red-800"
                      }`}>
                        {alarm.type}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        WhiteKon {alarm.unit}
                      </p>
                      <Badge 
                        variant={alarm.bit === 6 ? "outline" : "destructive"} 
                        className="mt-2"
                      >
                        Bit {alarm.bit}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                      {alarm.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Nenhum alarme de calibração ativo
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Polinômio de correção de temperatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="temp-a">a</Label>
                <Input
                  id="temp-a"
                  value={temperatureCorrection.a}
                  onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, a: e.target.value })}
                  className="bg-slate-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temp-b">b</Label>
                <Input
                  id="temp-b"
                  value={temperatureCorrection.b}
                  onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, b: e.target.value })}
                  className="bg-slate-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temp-c">c</Label>
                <Input
                  id="temp-c"
                  value={temperatureCorrection.c}
                  onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, c: e.target.value })}
                  className="bg-slate-800 text-white"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => handleReadValue("temp")}>
                Ler
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSendValue("temp")}>
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Polinômio de correção de brancura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="white-a">a</Label>
                <Input
                  id="white-a"
                  value={whitenessCorrection.a}
                  onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, a: e.target.value })}
                  className="bg-slate-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="white-b">b</Label>
                <Input
                  id="white-b"
                  value={whitenessCorrection.b}
                  onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, b: e.target.value })}
                  className="bg-slate-800 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="white-c">c</Label>
                <Input
                  id="white-c"
                  value={whitenessCorrection.c}
                  onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, c: e.target.value })}
                  className="bg-slate-800 text-white"
                />
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" onClick={() => handleReadValue("white")}>
                Ler
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSendValue("white")}>
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de Operação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="offset">Offset de brancura:</Label>
              <div className="flex gap-2">
                <Input
                  id="offset"
                  className="bg-slate-800 text-white"
                  value={offset}
                  onChange={(e) => setOffset(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={() => handleReadValue("offset")}>
                  Ler
                </Button>
                <Button variant="outline" size="sm" onClick={handleSetOffset} disabled={isLoading}>
                  Enviar
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gain">Ganho:</Label>
              <div className="flex gap-2">
                <Select value={gain} onValueChange={handleSetGain} disabled={isLoading}>
                  <SelectTrigger id="gain">
                    <SelectValue placeholder="Ganho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">1x</SelectItem>
                    <SelectItem value="1">4x</SelectItem>
                    <SelectItem value="2">16x</SelectItem>
                    <SelectItem value="3">60x</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleReadValue("gain")}>
                  Ler
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="integration">Tempo de integração:</Label>
              <div className="flex gap-2">
                <Select value={integrationTime} onValueChange={handleSetIntegrationTime} disabled={isLoading}>
                  <SelectTrigger id="integration">
                    <SelectValue placeholder="Tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">2,4 ms</SelectItem>
                    <SelectItem value="1">24 ms</SelectItem>
                    <SelectItem value="2">50 ms</SelectItem>
                    <SelectItem value="3">101 ms</SelectItem>
                    <SelectItem value="4">154 ms</SelectItem>
                    <SelectItem value="5">700 ms</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleReadValue("integration")}>
                  Ler
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mode">Modo:</Label>
              <div className="flex gap-2">
                <Select value={mode} onValueChange={(value) => handleSetAutoMode(value === "0")} disabled={isLoading}>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">AUTOMÁTICO</SelectItem>
                    <SelectItem value="1">MANUAL</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => handleReadValue("mode")}>
                  Ler
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="min-whiteness">Brancura mínima (%):</Label>
              <div className="flex gap-2">
                <Input
                  id="min-whiteness"
                  className="bg-slate-800 text-white"
                  value={minWhiteness}
                  onChange={(e) => setMinWhiteness(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={() => handleReadValue("min-whiteness")}>
                  Ler
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max-whiteness">Brancura máxima (%):</Label>
              <div className="flex gap-2">
                <Input
                  id="max-whiteness"
                  className="bg-slate-800 text-white"
                  value={maxWhiteness}
                  onChange={(e) => setMaxWhiteness(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={() => handleReadValue("max-whiteness")}>
                  Ler
                </Button>
              </div>
            </div>

            <div className="col-span-2">
              <Button
                onClick={handleSetBrightnessLimits}
                disabled={!minWhiteness || !maxWhiteness || isLoading}
                className="bg-[#00A651] hover:bg-[#008a43] text-white"
              >
                Atualizar Limites de Brancura
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Controle de LED:</Label>
              <div className="flex gap-2">
                <Button
                  variant={ledStatus ? "default" : "outline"}
                  className={ledStatus ? "bg-[#00A651]" : ""}
                  onClick={() => setLedStatus(true)}
                  disabled={isLoading}
                >
                  Liga LED
                </Button>
                <Button
                  variant={!ledStatus ? "default" : "outline"}
                  className={!ledStatus ? "bg-red-500" : ""}
                  onClick={() => setLedStatus(false)}
                  disabled={isLoading}
                >
                  Desliga LED
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
