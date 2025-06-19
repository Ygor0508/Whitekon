"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import type { WhiteKon } from "@/lib/types"
import { Plus, Settings, Wifi, WifiOff, Activity } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [devices, setDevices] = useState<WhiteKon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = () => {
    try {
      const loadedDevices = WhiteKonStorage.getAll()
      setDevices(loadedDevices)
    } catch (error) {
      console.error("Erro ao carregar dispositivos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectedDevices = devices.filter((d) => d.isConnected)
  const totalDevices = devices.length

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard WhiteKon</h1>
          <p className="text-gray-600">Sistema de monitoramento de medidores de brancura</p>
        </div>
        <Button asChild className="bg-[#00A651] hover:bg-[#008a43] text-white">
          <Link href="/whitekon/cadastro">
            <Plus className="h-4 w-4 mr-2" />
            Novo WhiteKon
          </Link>
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Dispositivos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">WhiteKons cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Conectados</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedDevices.length}</div>
            <p className="text-xs text-muted-foreground">Ativos no momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{totalDevices - connectedDevices.length}</div>
            <p className="text-xs text-muted-foreground">Desconectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Dispositivos */}
      {totalDevices > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos WhiteKon</CardTitle>
            <CardDescription>Lista de todos os medidores de brancura cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {device.isConnected ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-gray-400" />
                      )}
                      <Badge variant={device.isConnected ? "default" : "secondary"}>RTU {device.rtuAddress}</Badge>
                    </div>
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-sm text-gray-600">{device.machineName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={device.isConnected ? "default" : "secondary"}>
                      {device.isConnected ? "Conectado" : "Desconectado"}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/whitekon/gerenciar/${device.id}`}>
                        <Settings className="h-4 w-4 mr-1" />
                        Gerenciar
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <Button asChild variant="outline">
                <Link href="/whitekon/lista">Ver Todos os Dispositivos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Nenhum WhiteKon cadastrado</h3>
              <p className="text-gray-500 mb-4">Cadastre seu primeiro medidor de brancura para começar a monitorar</p>
              <Button asChild className="bg-[#00A651] hover:bg-[#008a43] text-white">
                <Link href="/whitekon/cadastro">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro WhiteKon
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
