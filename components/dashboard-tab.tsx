// components/dashboard-tab.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon, TrendingUp, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react"
import { WhitekonMonitor } from "@/components/whitekon-monitor"
import { useWhitekon } from "@/contexts/whitekon-context"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import { ALARM_TYPES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DashboardTabProps {
  deviceId: string;
}

export function DashboardTab({ deviceId }: DashboardTabProps) {
  const [silenceAlarms, setSilenceAlarms] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [alarms, setAlarms] = useState<any[]>([])
  
  const { toast } = useToast()
  const { isConnected, allDevicesData, chartHistory, clearChartHistory } = useWhitekon()

  const device = WhiteKonStorage.getById(deviceId);
  const deviceData = allDevicesData.get(deviceId);
  const registers = deviceData?.registers;
  const history = chartHistory.get(deviceId) || [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const alarmRegisterValue = registers?.[10];
    if (alarmRegisterValue != null) {
      processAlarms(alarmRegisterValue)
    }
  }, [registers])

  const processAlarms = (alarmBits: number) => {
    const newAlarms: any[] = [];
    for (let bit = 0; bit <= 15; bit++) {
      if (alarmBits & (1 << bit)) {
        const alarmInfo = ALARM_TYPES.find(alarm => alarm.bit === bit);
        if (alarmInfo) {
          newAlarms.push({
            id: bit,
            bit: bit,
            type: alarmInfo.type,
            description: alarmInfo.description,
            unit: device?.rtuAddress,
            time: new Date().toLocaleTimeString('pt-BR'),
            priority: alarmInfo.type === "FUNCIONAMENTO" ? "high" : "medium"
          });
        }
      }
    }
    setAlarms(newAlarms);
  }

  const handleEmergencyToggle = () => {
    const newState = !emergencyMode
    setEmergencyMode(newState)
    toast({
      title: `Modo de emergência ${newState ? 'ativado' : 'desativado'}`,
      variant: newState ? "destructive" : "default",
    })
  }

  const handleSilenceAlarmsToggle = () => {
    const newState = !silenceAlarms
    setSilenceAlarms(newState)
    toast({ title: `Alarmes ${newState ? 'silenciados' : 'ativados'}` })
  }

  const handleClearHistory = () => {
    clearChartHistory(deviceId)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2 text-gray-800">{`⏰ ${label}`}</p>
          {payload.map((entry: any, index: number) => {
            let displayValue = 'N/A';
            let unit = '';
            
            if (entry.value !== null && entry.value !== undefined) {
              if (entry.dataKey === 'brancuraMedia' || entry.dataKey === 'brancuraOnline') {
                unit = '%';
                displayValue = entry.value.toFixed(2);
              } else if (entry.dataKey === 'contadorAmostras') {
                displayValue = entry.value.toString();
              }
            }
            
            return (
              <p key={index} className="text-sm flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                <span className="font-medium">{entry.name}:</span>
                <span className="ml-1">{displayValue}{unit}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button variant={emergencyMode ? "destructive" : "outline"} onClick={handleEmergencyToggle}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Emergência
          </Button>
          <Button variant={silenceAlarms ? "secondary" : "outline"} onClick={handleSilenceAlarmsToggle}>
            {silenceAlarms ? <BellOff className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
            {silenceAlarms ? 'Silêncio' : 'Silenciar'}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ThermometerIcon className="h-4 w-4 text-orange-500" />
            <span>Temp: {registers?.[7] != null ? (registers[7] / 10).toFixed(1) : "N/A"} °C</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
          </div>
        </div>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WhitekonMonitor registers={registers} isConnected={isConnected} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alarmes Ativos</span>
              {alarms.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {alarms.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {alarms.length > 0 ? (
              <div className="space-y-3">
                {alarms.map((alarm) => {
                  const isSuccess = alarm.bit === 6;
                  return (
                    <div 
                      key={`${alarm.unit}-${alarm.bit}`} 
                      className={cn(
                        "p-3 border rounded-md flex justify-between items-start",
                        isSuccess 
                          ? "bg-green-50 border-green-200" 
                          : alarm.priority === 'high' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-yellow-50 border-yellow-200'
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isSuccess 
                            ? <CheckCircle2 className="h-4 w-4 text-green-600" /> 
                            : <AlertTriangle className="h-4 w-4 text-red-500" />
                          }
                          <span className={cn(
                            "px-2 py-1 text-xs rounded font-medium",
                            isSuccess 
                              ? 'bg-green-100 text-green-800'
                              : alarm.type === 'FUNCIONAMENTO' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          )}>
                            {alarm.type}
                          </span>
                          {/* <span className="text-xs text-gray-500">Bit {alarm.bit}</span> */}
                        </div>
                        <p className={cn(
                          "font-medium text-sm",
                          isSuccess ? 'text-green-800' : alarm.priority === 'high' ? 'text-red-800' : 'text-yellow-800'
                        )}>
                          {alarm.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">WhiteKon {alarm.unit}</p>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {alarm.time}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium">Nenhum alarme ativo</p>
                <p className="text-sm">Sistema operando normalmente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gráfico de Leituras (Última Hora)
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Pontos: {history.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aguardando dados...</p>
                <p className="text-sm">O gráfico será exibido quando houver dados disponíveis</p>
              </div>
            </div>
          ) : (
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorBrancuraMedia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="time" tickLine={false} axisLine={true} tickMargin={8} angle={-45} textAnchor="end" height={60} interval="preserveStartEnd" minTickGap={30} fontSize={11} stroke="#6b7280" />
                  <YAxis yAxisId="brancura" orientation="left" stroke="#3b82f6" tickLine={false} axisLine={true} tickMargin={8} domain={['auto', 'auto']} label={{ value: 'Brancura (%)', angle: -90, position: 'insideLeft' }} fontSize={11} />
                  {/* [MODIFIED] - Adicionado allowDecimals={false} para forçar ticks inteiros */}
                  <YAxis yAxisId="amostras" orientation="right" stroke="#10b981" tickLine={false} axisLine={true} tickMargin={8} domain={['auto', 'auto']} label={{ value: 'Amostras', angle: 90, position: 'insideRight' }} fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                  {/* [MODIFIED] - Adicionado isAnimationActive={false} para remover animação */}
                  {/* <Area yAxisId="brancura" dataKey="brancuraMedia" type="monotone" fill="url(#colorBrancuraMedia)" stroke="#3b82f6" strokeWidth={2} name="Brancura Média (%)" connectNulls={false} isAnimationActive={false} />
                  <Line yAxisId="brancura" dataKey="brancuraOnline" name="Brancura Online (%)" type="monotone" stroke="#ef4444" strokeWidth={2} dot={{ r: 2, fill: "#ef4444" }} activeDot={{ r: 4, fill: "#ef4444" }} connectNulls={false} isAnimationActive={false} />
                  <Line yAxisId="amostras" dataKey="contadorAmostras" name="Contador Amostras" type="stepAfter" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6, fill: "#10b981" }} connectNulls={false} isAnimationActive={false} /> */}
                  {/* DEPOIS (Com linhas contínuas) */}
                  <Area yAxisId="brancura" dataKey="brancuraMedia" type="monotone" fill="url(#colorBrancuraMedia)" stroke="#3b82f6" strokeWidth={2} name="Brancura Média (%)" connectNulls={false} isAnimationActive={false} dot={false} />
                  <Line yAxisId="brancura" dataKey="brancuraOnline" name="Brancura Online (%)" type="monotone" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive={false} />
                  <Line yAxisId="amostras" dataKey="contadorAmostras" name="Contador Amostras" type="stepAfter" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}