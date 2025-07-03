//app/whitekon/cadastro/page.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import { ArrowLeft } from "lucide-react"

export default function CadastroWhiteKonPage() {
  const [name, setName] = useState("")
  const [rtuAddress, setRtuAddress] = useState("")
  const [machineName, setMachineName] = useState("")
  const [port, setPort] = useState("")
  const [baudRate, setBaudRate] = useState("115200")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !rtuAddress.trim() || !machineName.trim()) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive",
      })
      return
    }

    const rtuNum = Number.parseInt(rtuAddress)
    if (isNaN(rtuNum) || rtuNum < 1 || rtuNum > 247) {
      toast({
        title: "Erro de validação",
        description: "Endereço RTU deve ser um número entre 1 e 247",
        variant: "destructive",
      })
      return
    }

    // Verifica se já existe um dispositivo com o mesmo endereço RTU
    const existing = WhiteKonStorage.getByRtuAddress(rtuNum)
    if (existing) {
      toast({
        title: "Erro de validação",
        description: `Já existe um WhiteKon cadastrado com o endereço RTU ${rtuNum}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newDevice = WhiteKonStorage.add({
        name: name.trim(),
        rtuAddress: rtuNum,
        machineName: machineName.trim(),
        port: port.trim() || undefined,
        baudRate: Number.parseInt(baudRate),
        isConnected: false,
      })

      toast({
        title: "WhiteKon cadastrado",
        description: `${newDevice.name} foi cadastrado com sucesso`,
      })

      router.push("/whitekon/lista")
    } catch (error) {
      console.error("Erro ao cadastrar WhiteKon:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o WhiteKon",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar WhiteKon</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Dispositivo WhiteKon</CardTitle>
          <CardDescription>Cadastre um novo medidor de brancura WhiteKon no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do WhiteKon *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: WhiteKon Principal"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rtuAddress">Endereço RTU *</Label>
                <Input
                  id="rtuAddress"
                  type="number"
                  min="1"
                  max="247"
                  value={rtuAddress}
                  onChange={(e) => setRtuAddress(e.target.value)}
                  placeholder="Ex: 4"
                  required
                />
                <p className="text-sm text-gray-500">Endereço Modbus do dispositivo (1-247)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="machineName">Nome da Máquina *</Label>
                <Input
                  id="machineName"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  placeholder="Ex: Beneficiadora Linha 1"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="port">Porta Serial (Opcional)</Label>
                <Input id="port" value={port} onChange={(e) => setPort(e.target.value)} placeholder="Ex: COM8" />
                <p className="text-sm text-gray-500">Porta padrão para conexão (pode ser alterada posteriormente)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="baudRate">Baud Rate</Label>
                <Select value={baudRate} onValueChange={setBaudRate}>
                  <SelectTrigger id="baudRate">
                    <SelectValue />
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
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="bg-[#00A651] hover:bg-[#008a43] text-white">
                {isLoading ? "Cadastrando..." : "Cadastrar WhiteKon"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/whitekon/lista")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
