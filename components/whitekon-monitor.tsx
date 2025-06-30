"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useWhitekon } from "@/contexts/whitekon-context"

interface WhitekonMonitorProps {
  whitekonId: number
}

// Função auxiliar para formatar os valores, retornando 'N/A' se o valor for nulo ou indefinido.
const formatValue = (value: number | null | undefined, unit = '') => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return `${value}${unit}`;
};

export function WhitekonMonitor({ whitekonId }: WhitekonMonitorProps) {
  const { whitekonData: contextData, isConnected } = useWhitekon();

  // Se não há conexão, exibe a mensagem apropriada.
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-2">Dispositivo não conectado</p>
        <p className="text-sm text-gray-400">Conecte o dispositivo na aba Conexão</p>
      </div>
    );
  }

  // Se não há dados ainda, exibe a mensagem de aguardo.
  if (!contextData?.registers) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-2">Aguardando dados...</p>
        <p className="text-sm text-gray-400">Os dados serão exibidos em breve</p>
      </div>
    );
  }

  // Extrai os dados dos registradores para fácil acesso.
  const registers = contextData.registers;
  const tempCalibracao = registers[6] !== null ? registers[6] / 10 : null;
  const tempOnline = registers[7] !== null ? registers[7] / 10 : null;
  const brancuraMedia = registers[5] !== null ? registers[5] / 10 : null;
  const brancuraOnline = registers[21] !== null ? registers[21] / 10 : null;
  const desvioPadrao = registers[11] !== null ? registers[11] / 100 : null;
  const qtdAmostras = registers[19] != null ? registers[19] + 1 : null;
  const gain = registers[34] !== null ? registers[34] & 0xff : null;
  const tempoIntegracao = registers[34] !== null ? (registers[34] >> 8) & 0xff : null;
  const ledStatus = registers[28] !== null ? (registers[28] & 1) === 1 : null;
  const modoOperacao = registers[29] !== null ? (registers[29] === 0 ? "AUTOMÁTICO" : "MANUAL") : null;

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
                  <span className="font-mono">{formatValue(tempCalibracao, " °C")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Temp. Online:</Label>
                  <span className="font-mono">{formatValue(tempOnline, " °C")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Red:</Label>
                  <span className="font-mono">{formatValue(registers[15])}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Green:</Label>
                  <span className="font-mono">{formatValue(registers[16])}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Blue:</Label>
                  <span className="font-mono">{formatValue(registers[17])}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Clear:</Label>
                  <span className="font-mono">{formatValue(registers[18])}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Blue Cal. Esc.:</Label>
                  <span className="font-mono">{formatValue(registers[8])}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Blue Cal. Claro:</Label>
                  <span className="font-mono">{formatValue(registers[9])}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Brancura</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-yellow-500 font-bold">Brancura:</Label>
                  <span className="font-mono font-bold">{formatValue(brancuraMedia, "%")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Br. Online:</Label>
                  <span className="font-mono">{formatValue(brancuraOnline, "%")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Desvio Padrão:</Label>
                  <span className="font-mono">{formatValue(desvioPadrao, "%")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Qtd. Amostras:</Label>
                  <span className="font-mono">{formatValue(qtdAmostras)}</span>
                </div>
              </div>
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
                  <Badge variant="outline">{formatValue(gain)}</Badge>
                </div>
                <div className="flex justify-between">
                  <Label>Tempo Int.:</Label>
                  <Badge variant="outline">{formatValue(tempoIntegracao)}</Badge>
                </div>
                <div className="flex justify-between">
                  <Label>LED:</Label>
                  <Badge variant="outline">{ledStatus === null ? "N/A" : (ledStatus ? "ON" : "OFF")}</Badge>
                </div>
                <div className="flex justify-between">
                  <Label>Modo Operação:</Label>
                  <Badge variant="outline">{modoOperacao !== null ? modoOperacao : "N/A"}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Br. Mínima:</Label>
                  <span className="font-mono">{formatValue(registers[53] !== null ? registers[53] / 10 : null, "%")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Br. Máxima:</Label>
                  <span className="font-mono">{formatValue(registers[54] !== null ? registers[54] / 10 : null, "%")}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Claro Máximo:</Label>
                  <span className="font-mono">{formatValue(registers[56])}</span>
                </div>
                <div className="flex justify-between">
                  <Label>Escuro Máximo:</Label>
                  <span className="font-mono">{formatValue(registers[55])}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Padrão Escuro</Label>
                <div className="h-12 bg-slate-800 rounded-md mt-1 flex items-center justify-center text-white font-mono">
                  {formatValue(registers[50])}
                </div>
              </div>
              <div>
                <Label>Padrão Claro</Label>
                <div className="h-12 bg-gray-100 border rounded-md mt-1 flex items-center justify-center font-mono">
                  {formatValue(registers[51])}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}