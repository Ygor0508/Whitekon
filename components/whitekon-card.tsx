// components/whitekon-card.tsx

"use client"

import { useState, useEffect } from "react"
import type { WhiteKon } from "@/lib/types"
import { useWhitekon } from "@/contexts/whitekon-context"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

interface WhiteKonCardProps {
  device: WhiteKon;
}

interface RealtimeData {
  tempOnline: string | null;
  blue: number | null;
  brancura: string | null;
  brancuraOnline: string | null;
  desvioPadrao: string | null;
  qtdAmostras: number | null;
  modoOperacao: string | null;
}

export function WhiteKonCard({ device }: WhiteKonCardProps) {
  const { allDevicesData, isConnected: isPortConnected } = useWhitekon();
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);

  const deviceData = allDevicesData.get(device.id);
  const isThisDeviceOnline = isPortConnected && deviceData && !deviceData.error;

  useEffect(() => {
    if (isThisDeviceOnline && deviceData?.registers) {
      const { registers } = deviceData;
      
      const getModoOperacao = (code: number | null) => {
        if (code === null) return "Indefinido";
        return code === 0 ? "Automático" : "Manual";
      };

      setRealtimeData({
        tempOnline: registers[7] != null ? (registers[7] / 10).toFixed(1) + " °C" : "---",
        blue: registers[17] ?? null,
        brancura: registers[5] != null ? (registers[5] / 10).toFixed(1) + " %" : "---",
        brancuraOnline: registers[21] != null ? (registers[21] / 10).toFixed(1) + " %" : "---",
        desvioPadrao: registers[11] != null ? (registers[11] / 100).toFixed(2) + " %" : "---",
        qtdAmostras: registers[19] != null ? registers[19] + 1 : null,
        modoOperacao: getModoOperacao(registers[29]), 
      });
    } else {
      setRealtimeData(null);
    }
  }, [deviceData, isThisDeviceOnline]);

  const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
    <div className="flex justify-between items-center text-sm">
      <p className="text-muted-foreground">{label}:</p>
      <p className="font-mono font-medium">{value ?? "---"}</p>
    </div>
  );

  return (
    <>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{device.name}</CardTitle>
          <Badge variant={isThisDeviceOnline ? "default" : "secondary"}>
            {isThisDeviceOnline ? <Wifi className="h-4 w-4 mr-2 animate-pulse" /> : <WifiOff className="h-4 w-4 mr-2" />}
            {isThisDeviceOnline ? "Conectado" : "Offline"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          RTU: {device.rtuAddress} | Máquina: {device.machineName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/20">
          <InfoRow label="Temp. Online" value={realtimeData?.tempOnline ?? null} />
          <InfoRow label="Brancura" value={realtimeData?.brancura ?? null} />
          <InfoRow label="Blue" value={realtimeData?.blue ?? null} />
          <InfoRow label="Desvio Padrão" value={realtimeData?.desvioPadrao ?? null} />
          <InfoRow label="Brancura Online" value={realtimeData?.brancuraOnline ?? null} />
          <InfoRow label="Amostras" value={realtimeData?.qtdAmostras ?? null} />
          <InfoRow label="Modo Operação" value={realtimeData?.modoOperacao ?? null} />
        </div>
      </CardContent>
    </>
  );
}