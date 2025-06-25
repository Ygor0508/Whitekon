"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"
import { useWhitekon } from "@/contexts/whitekon-context"

interface WhitekonMonitorProps {
  whitekonId: number
}

export function WhitekonMonitor({ whitekonId }: WhitekonMonitorProps) {
  const [heartbeat, setHeartbeat] = useState(false)
  const [whitekonData, setWhitekonData] = useState<any>(null)

  const { whitekonData: contextData, isConnected } = useWhitekon()

  useEffect(() => {
    if (contextData?.registers) {
      // Converte os registros para o formato esperado
      const convertedData = {
        temperatura: {
          calibracao: contextData.registers[6] ? contextData.registers[6] / 10 : 0,
          online: contextData.registers[7] ? contextData.registers[7] / 10 : 0,
        },
        rgb: {
          red: contextData.registers[15] || 0,
          green: contextData.registers[16] || 0,
          blue: contextData.registers[17] || 0,
          clear: contextData.registers[18] || 0,
        },
        blue_calibracao: {
          preto: contextData.registers[8] || 0,
          branco: contextData.registers[9] || 0,
        },
        brancura: {
          media: contextData.registers[5] ? contextData.registers[5] / 10 : 0,
          online: contextData.registers[21] ? contextData.registers[21] / 10 : 0,
          desvio_padrao: contextData.registers[11] ? contextData.registers[11] / 100 : 0,
        },
        amostras: contextData.registers[19] || 0,
        ganho: contextData.registers[34] ? contextData.registers[34] & 0xff : 0,
        tempoIntegracao: contextData.registers[34] ? (contextData.registers[34] >> 8) & 0xff : 0,
        ledStatus: contextData.registers[28] ? (contextData.registers[28] & 1) === 1 : false,
        modo: contextData.registers[29] || 0,
        brancuraMinima: contextData.registers[53] ? contextData.registers[53] / 10 : 0,
        brancuraMaxima: contextData.registers[54] ? contextData.registers[54] / 10 : 0,
        claroMaximo: contextData.registers[56] || 0,
        escuroMaximo: contextData.registers[55] || 0,
      }
      setWhitekonData(convertedData)
    }
  }, [contextData])

  // // Simulação de heartbeat apenas para indicar que o componente está ativo
  // useEffect(() => {
  //   if (!isConnected) return

  //   const interval = setInterval(() => {
  //     setHeartbeat((prev) => !prev)
  //   }, 1000)

  //   return () => clearInterval(interval)
  // }, [isConnected])

  // Se não há dados, mostra mensagem
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-2">Dispositivo não conectado</p>
        <p className="text-sm text-gray-400">Conecte o dispositivo na aba Conexão</p>
      </div>
    )
  }

  if (!whitekonData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-2">Aguardando dados...</p>
        <p className="text-sm text-gray-400">Os dados serão exibidos em breve</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-4">Leituras</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temp. Calibração:</Label>
                  <span className="font-mono">{whitekonData.temperatura.calibracao} °C</span>
                </div>
                <div className="flex justify-between">
                  <Label>Temp. Online:</Label>
                  <span className="font-mono">{whitekonData.temperatura.online} °C</span>
                </div>
                <div className="flex justify-between">
                  <Label>Red:</Label>
                  <span className="font-mono">{whitekonData.rgb.red}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Green:</Label>
                  <span className="font-mono">{whitekonData.rgb.green}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Blue:</Label>
                  <span className="font-mono">{whitekonData.rgb.blue}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Clear:</Label>
                  <span className="font-mono">{whitekonData.rgb.clear}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Blue Cal. Esc.:</Label>
                  <span className="font-mono">{whitekonData.blue_calibracao.preto}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Blue Cal. Claro:</Label>
                  <span className="font-mono">{whitekonData.blue_calibracao.branco}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Brancura</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-yellow-500 font-bold">Brancura:</Label>
                  <span className="font-mono font-bold">{whitekonData.brancura.media}%</span>
                </div>
                <div className="flex justify-between">
                  <Label>Br. Online:</Label>
                  <span className="font-mono">{whitekonData.brancura.online}%</span>
                </div>
                <div className="flex justify-between">
                  <Label>Desvio Padrão:</Label>
                  <span className="font-mono">{whitekonData.brancura.desvio_padrao}%</span>
                </div>
                <div className="flex justify-between">
                  <Label>Qtd. Amostras:</Label>
                  <span className="font-mono">{whitekonData.amostras}</span>
                </div>
              </div>

              {/* <div className="mt-4 flex justify-center">
                <Button variant="outline" className={`w-20 h-20 rounded-full ${heartbeat ? "bg-green-100" : ""}`}>
                  <Heart className={`h-10 w-10 ${heartbeat ? "text-green-500" : "text-gray-400"}`} />
                </Button>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4">
            <h3 className="font-bold">Parâmetros</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Ganho:</Label>
                  <Badge variant="outline">{whitekonData.ganho !== undefined ? whitekonData.ganho : "N/A"}</Badge>
                </div>
                <div className="flex justify-between">
                  <Label>Tempo Int.:</Label>
                  <Badge variant="outline">
                    {whitekonData.tempoIntegracao !== undefined ? whitekonData.tempoIntegracao : "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <Label>LED:</Label>
                  <Badge variant="outline">
                    {whitekonData.ledStatus !== undefined ? (whitekonData.ledStatus ? "ON" : "OFF") : "N/A"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <Label>Modo Operação:</Label>
                  <Badge variant="outline">
                    {whitekonData.modo !== undefined ? (whitekonData.modo === 0 ? "AUTOMÁTICO" : "MANUAL") : "N/A"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Br. Mínima:</Label>
                  <span className="font-mono">
                    {whitekonData.brancuraMinima !== undefined ? `${whitekonData.brancuraMinima}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Br. Máxima:</Label>
                  <span className="font-mono">
                    {whitekonData.brancuraMaxima !== undefined ? `${whitekonData.brancuraMaxima}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Claro Máximo:</Label>
                  <span className="font-mono">
                    {whitekonData.claroMaximo !== undefined ? whitekonData.claroMaximo : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Escuro Máximo:</Label>
                  <span className="font-mono">
                    {whitekonData.escuroMaximo !== undefined ? whitekonData.escuroMaximo : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Padrão Escuro</Label>
                <div className="h-12 bg-slate-800 rounded-md mt-1"></div>
              </div>
              <div>
                <Label>Padrão Claro</Label>
                <div className="h-12 bg-gray-100 border rounded-md mt-1"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}