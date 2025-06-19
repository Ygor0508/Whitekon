"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import type { WhiteKon } from "@/lib/types"
import { Plus, Settings, Trash2, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ListaWhiteKonPage() {
  const [devices, setDevices] = useState<WhiteKon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = () => {
    try {
      const loadedDevices = WhiteKonStorage.getAll()
      setDevices(loadedDevices)
    } catch (error) {
      console.error("Erro ao carregar dispositivos:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar a lista de dispositivos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (device: WhiteKon) => {
    if (confirm(`Tem certeza que deseja excluir o WhiteKon "${device.name}"?`)) {
      try {
        WhiteKonStorage.delete(device.id)
        loadDevices()
        toast({
          title: "WhiteKon excluído",
          description: `${device.name} foi removido do sistema`,
        })
      } catch (error) {
        console.error("Erro ao excluir dispositivo:", error)
        toast({
          title: "Erro",
          description: "Erro ao excluir o dispositivo",
          variant: "destructive",
        })
      }
    }
  }

  const handleManage = (device: WhiteKon) => {
    router.push(`/whitekon/gerenciar/${device.id}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando dispositivos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">WhiteKons Cadastrados</h1>
        <Button
          onClick={() => router.push("/whitekon/cadastro")}
          className="bg-[#00A651] hover:bg-[#008a43] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo WhiteKon
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Nenhum WhiteKon cadastrado</h3>
              <p className="text-gray-500 mb-4">Cadastre seu primeiro medidor de brancura para começar</p>
              <Button
                onClick={() => router.push("/whitekon/cadastro")}
                className="bg-[#00A651] hover:bg-[#008a43] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar WhiteKon
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">RTU: {device.rtuAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.isConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                    <Badge variant={device.isConnected ? "default" : "secondary"}>
                      {device.isConnected ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Máquina:</p>
                  <p className="text-sm text-gray-600">{device.machineName}</p>
                </div>

                {device.port && (
                  <div>
                    <p className="text-sm font-medium">Porta:</p>
                    <p className="text-sm text-gray-600">
                      {device.port} @ {device.baudRate} bps
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Cadastrado em:</p>
                  <p className="text-sm text-gray-600">{device.createdAt.toLocaleDateString("pt-BR")}</p>
                </div>

                {device.lastConnection && (
                  <div>
                    <p className="text-sm font-medium">Última conexão:</p>
                    <p className="text-sm text-gray-600">{device.lastConnection.toLocaleString("pt-BR")}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleManage(device)}
                    className="flex-1 bg-[#00A651] hover:bg-[#008a43] text-white"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Gerenciar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(device)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
