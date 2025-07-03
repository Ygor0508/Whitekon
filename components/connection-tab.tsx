// components/connection-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWhitekon } from "@/contexts/whitekon-context"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { WhiteKon } from "@/lib/types" // Importe o tipo

// Interface para definir as propriedades que o componente recebe
interface ConnectionTabProps {
  device: WhiteKon | null;
}

export function ConnectionTab({ device }: ConnectionTabProps) {
  const { connect, disconnect, isConnected, isConnecting, connectionParams } = useWhitekon()
  
  // Estados locais para controlar os inputs
  const [port, setPort] = useState(connectionParams?.port || "COM8")
  const [baudRate, setBaudRate] = useState(connectionParams?.baudRate || "115200")

  const handleConnect = () => {
    connect(port, baudRate)
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuração de Conexão</CardTitle>
          <CardDescription>
            Configure e gerencie a conexão com o medidor Whitekon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="port">Porta</Label>
              <Select value={port} onValueChange={setPort} disabled={isConnected || isConnecting}>
                <SelectTrigger id="port">
                  <SelectValue placeholder="Selecione a porta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COM3">COM3</SelectItem>
                  <SelectItem value="COM4">COM4</SelectItem>
                  <SelectItem value="COM5">COM5</SelectItem>
                  <SelectItem value="COM8">COM8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="baudrate">Baud Rate</Label>
              <Select value={baudRate} onValueChange={setBaudRate} disabled={isConnected || isConnecting}>
                <SelectTrigger id="baudrate">
                  <SelectValue placeholder="Selecione o baud rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9600">9600</SelectItem>
                  <SelectItem value="19200">19200</SelectItem>
                  <SelectItem value="38400">38400</SelectItem>
                  <SelectItem value="57600">57600</SelectItem>
                  <SelectItem value="115200">115200</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* CAMPO ADICIONADO PARA EXIBIR O ENDEREÇO RTU */}
            <div className="space-y-1.5">
              <Label htmlFor="rtu-address">Endereço RTU do Dispositivo</Label>
              <Input
                id="rtu-address"
                value={device ? device.rtuAddress : "Carregando..."}
                disabled
                className="font-mono text-center bg-muted"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex gap-4">
                <Button onClick={handleConnect} className="w-full" disabled={isConnected || isConnecting}>
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Conectar
                </Button>
                <Button onClick={disconnect} variant="destructive" className="w-full" disabled={!isConnected || isConnecting}>
                  Desconectar
                </Button>
            </div>

            {isConnected && (
                <div className="p-3 text-center bg-green-100 text-green-800 rounded-md border border-green-200">
                    <p className="font-bold">CONECTADO</p>
                    <p className="text-sm font-mono">{connectionParams?.port} @ {connectionParams?.baudRate} bps</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}