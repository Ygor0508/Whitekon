"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"
import { useWhitekon } from "@/contexts/whitekon-context"

interface ConnectionTabProps {
  onConnectionChangeAction: (connected: boolean) => void
}

export function ConnectionTab({ onConnectionChangeAction }: ConnectionTabProps) {
  const [port, setPort] = useState("")
  const [baudRate, setBaudRate] = useState("115200")
  const [address, setAddress] = useState("4")
  const [availablePorts, setAvailablePorts] = useState([
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "COM10",
    "/dev/ttyUSB0",
    "/dev/ttyUSB1",
    "/dev/ttyS0",
    "/dev/ttyS1",
    "/dev/ttyACM0",
  ])

  const { isConnected, isConnecting, connectionParams, connect, disconnect } = useWhitekon()

  // Sincroniza com o contexto
  useEffect(() => {
    onConnectionChangeAction(isConnected)
  }, [isConnected, onConnectionChangeAction])

  // Carrega parâmetros salvos se existirem
  useEffect(() => {
    if (connectionParams) {
      setPort(connectionParams.port)
      setBaudRate(connectionParams.baudRate)
      setAddress(connectionParams.address)
    }
  }, [connectionParams])

  const handleConnect = async () => {
    if (!port) {
      return
    }

    await connect(port, baudRate, address)
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  const refreshPorts = () => {
    // Simulação de atualização de portas
    setAvailablePorts(["COM1", "COM2", "COM3", "COM4", "COM5", "COM8"])
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuração de Conexão</CardTitle>
        <CardDescription>Configure a conexão com o medidor WhiteKon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={refreshPorts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Obter Portas
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="port">Porta:</Label>
            <Select value={port} onValueChange={setPort} disabled={isConnected}>
              <SelectTrigger id="port">
                <SelectValue placeholder="Selecione uma porta" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="baudRate">Baud Rate:</Label>
            <Select value={baudRate} onValueChange={setBaudRate} disabled={isConnected}>
              <SelectTrigger id="baudRate">
                <SelectValue placeholder="Selecione o baud rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4800">4800</SelectItem>
                <SelectItem value="9600">9600</SelectItem>
                <SelectItem value="19200">19200</SelectItem>
                <SelectItem value="38400">38400</SelectItem>
                <SelectItem value="57600">57600</SelectItem>
                <SelectItem value="115200">115200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Endereço:</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-800 text-white"
              disabled={isConnected}
            />
          </div>
        </div>

        <div className="grid gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const customPort = prompt("Digite o nome da porta (ex: COM8, /dev/ttyUSB0):")
              if (customPort) {
                if (!availablePorts.includes(customPort)) {
                  setAvailablePorts((prev) => [...prev, customPort])
                }
                setPort(customPort)
              }
            }}
          >
            Adicionar Porta Manualmente
          </Button>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={handleConnect}
            disabled={!port || isConnected || isConnecting}
            className="bg-[#00A651] hover:bg-[#008a43] text-white"
          >
            {isConnecting ? "Conectando..." : "Conectar"}
          </Button>
          <Button variant="outline" onClick={handleDisconnect} disabled={!isConnected}>
            Desconectar
          </Button>
        </div>

        <div className="text-center pt-4">
          <div className={`text-2xl font-bold ${isConnected ? "text-[#00A651]" : "text-red-500"}`}>
            {isConnected ? "CONECTADO" : "DESCONECTADO"}
          </div>
          {connectionParams && isConnected && (
            <div className="text-sm text-gray-500 mt-2">
              {connectionParams.port} @ {connectionParams.baudRate} bps, RTU {connectionParams.address}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
