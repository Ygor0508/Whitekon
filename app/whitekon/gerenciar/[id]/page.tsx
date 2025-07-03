
//app/whitekon/gerenciar/[id]/page.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import { type WhiteKon, type WhiteKonData, INTEGRATION_TIME_CODES, GAIN_CODES, ALARM_TYPES } from "@/lib/types"
import { CalibrationCommands, WhitekonRegisters } from "@/lib/whitekon-registers"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Wifi, WifiOff, Edit, Save, X, Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react"
import { RegistersTabReal } from "@/components/registers-tab-real"
import { DashboardTab } from "@/components/dashboard-tab"
import { ConnectionTab } from "@/components/connection-tab"
import { useWhitekon } from "@/contexts/whitekon-context"

const CalibrationAlarms = ({ alarmRegisterValue }: { alarmRegisterValue: number }) => {
  const calibrationAlarms = ALARM_TYPES.filter(alarm => alarm.type === "CALIBRAÇÃO");

  const getActiveAlarms = () => {
    return calibrationAlarms.filter(alarm => (alarmRegisterValue >> alarm.bit) & 1);
  };

  const activeAlarms = getActiveAlarms();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          Status da Calibração
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlarms.length > 0 ? (
          <div className="space-y-2">
            {activeAlarms.map((alarm) => {
              const isSuccess = alarm.bit === 6;
              return (
                <div
                  key={alarm.bit}
                  className={`p-3 border rounded-md flex justify-between items-center ${
                    isSuccess
                      ? 'bg-green-100 border-green-200'
                      : 'bg-destructive/10 border-destructive/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    <p className={`font-medium ${isSuccess ? 'text-green-800' : 'text-destructive'}`}>
                      {alarm.description}
                    </p>
                  </div>
                  <Badge variant={isSuccess ? "default" : "destructive"} className={isSuccess ? "bg-green-600" : ""}>
                    Bit: {alarm.bit}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Nenhum status ou alarme de calibração ativo.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function GerenciarWhiteKonPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const { 
    isConnected, 
    allDevicesData, 
    readDeviceRegister, 
    writeDeviceRegister, 
    readAllDeviceRegisters,
    setPollingPriority // [NEW] Get the priority setter from context
  } = useWhitekon()

  const deviceId = params.id as string;
  const currentDeviceData = allDevicesData.get(deviceId);
  const registers = currentDeviceData?.registers;

  const [device, setDevice] = useState<WhiteKon | null>(null)

  const [isEditingParams, setIsEditingParams] = useState(false)
  const [editValues, setEditValues] = useState<Partial<WhiteKonData>>({})

  const [isManualControlActive, setIsManualControlActive] = useState(false)
  const [ledStatus, setLedStatus] = useState(false)
  const [bobinStatus, setBobinStatus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [isCalibrationModeActive, setIsCalibrationModeActive] = useState(false)
  const [calibrationScreenData, setCalibrationScreenData] = useState({
    bluePreto: null as number | null,
    blueBranco: null as number | null,
    brancuraSemCorrecao: null as number | null,
    brancuraOnline: null as number | null,
    blue: null as number | null,
  })

  const [activeTab, setActiveTab] = useState("dispositivos")

  useEffect(() => {
    if (!isConnected || !deviceId) {
      setPollingPriority({ mode: 'paused' });
      return;
    }

    if (activeTab === "calibration" && isCalibrationModeActive) {
     setPollingPriority({
      mode: 'high-frequency',
      deviceId: deviceId,
       // Usando os números diretos dos registradores
      registers: [8, 9, 17, 10], // BluePreto, BlueBranco, BlueAtual, Alarmes
       interval: 500
      });
    } else {
      
      setPollingPriority({ mode: 'global' });
    }

    
    return () => {
      setPollingPriority({ mode: 'global' });
    }
  }, [activeTab, isCalibrationModeActive, deviceId, isConnected, setPollingPriority]);

  const loadParametersFromDevice = useCallback(async () => {
    if (!isConnected || !deviceId) {
      toast({ title: "Dispositivo não conectado", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    toast({ title: "Lendo parâmetros da placa..." });
    try {
      await readAllDeviceRegisters(deviceId);
      toast({ title: "Parâmetros sincronizados com o dispositivo!" });
    } catch (error: any) {
      toast({ title: "Erro ao Sincronizar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, deviceId, readAllDeviceRegisters, toast]);

  useEffect(() => {
      if (registers) {
          // Lógica para os parâmetros gerais (pode manter como está)
          const loadedData: Partial<WhiteKonData> = {
              tempoLedLigado: registers[49],
              tempoLedDesligado: registers[48],
              tempoIntegracao: registers[34] != null ? (registers[34] >> 8) & 0xff : null,
              ganho: registers[34] != null ? registers[34] & 0xff : null,
              brancuraMinima: registers[53] != null ? registers[53] / 10.0 : null,
              brancuraMaxima: registers[54] != null ? registers[54] / 10.0 : null,
              offset: registers[52] != null ? registers[52] / 10.0 : null,
              coefACorrecaoA: registers[42],
              coefACorrecaoB: registers[44],
              coefACorrecaoC: registers[46],
          };
          setEditValues(prev => ({ ...prev, ...loadedData }));
          setIsManualControlActive(registers[29] === 1);
          setLedStatus(registers[28] != null && (registers[28] & 1) === 1);
          setBobinStatus(registers[28] != null && (registers[28] & 2) === 2);
          setIsCalibrationModeActive(registers[0] === 1);

          // [NOVA LÓGICA CORRIGIDA] - Atualiza a tela de calibração de forma estável
          setCalibrationScreenData(currentData => {
              const newData = {
                  bluePreto: registers[8] ?? null,
                  blueBranco: registers[9] ?? null,
                  blue: registers[17] ?? null,
                  brancuraSemCorrecao: registers[20] != null ? registers[20] / 10.0 : null,
                  brancuraOnline: registers[21] != null ? registers[21] / 10.0 : null,
              };
            
              // Compara o JSON dos dados antigos e novos. Só atualiza se houver mudança.
              if (JSON.stringify(currentData) === JSON.stringify(newData)) {
                  return currentData; // Retorna os dados antigos, sem re-renderizar
              }
              
              return newData; // Retorna os novos dados, atualizando a tela
          });
      }
    }, [registers]);

  const handleSaveParameters = async () => {
    if (!deviceId) return;
    setIsLoading(true);
    toast({ title: "Salvando parâmetros no dispositivo..." });
    try {
        const writePromises: Promise<boolean>[] = [];

        if (editValues.tempoLedLigado != null) writePromises.push(writeDeviceRegister(deviceId, 49, Number(editValues.tempoLedLigado)));
        if (editValues.tempoLedDesligado != null) writePromises.push(writeDeviceRegister(deviceId, 48, Number(editValues.tempoLedDesligado)));
        if (editValues.brancuraMinima != null) writePromises.push(writeDeviceRegister(deviceId, 53, Math.round(Number(editValues.brancuraMinima) * 10)));
        if (editValues.brancuraMaxima != null) writePromises.push(writeDeviceRegister(deviceId, 54, Math.round(Number(editValues.brancuraMaxima) * 10)));
        if (editValues.offset != null) writePromises.push(writeDeviceRegister(deviceId, 52, Math.round(Number(editValues.offset) * 10)));
        if (editValues.coefACorrecaoA != null) writePromises.push(writeDeviceRegister(deviceId, 42, Number(editValues.coefACorrecaoA)));
        if (editValues.coefACorrecaoB != null) writePromises.push(writeDeviceRegister(deviceId, 44, Number(editValues.coefACorrecaoB)));
        if (editValues.coefACorrecaoC != null) writePromises.push(writeDeviceRegister(deviceId, 46, Number(editValues.coefACorrecaoC)));
        
        const tempo = editValues.tempoIntegracao ?? 0;
        const ganho = editValues.ganho ?? 0;
        writePromises.push(writeDeviceRegister(deviceId, 34, (tempo << 8) | ganho));

        await Promise.all(writePromises);
        toast({ title: "Sucesso!", description: "Parâmetros salvos no dispositivo." });

        setIsEditingParams(false);
        await loadParametersFromDevice(); 

    } catch (error: any) {
        toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };
  
  const loadCalibrationScreenData = useCallback(async () => {
    if (!isConnected || !deviceId) {
      toast({ title: "Dispositivo não conectado", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    toast({ title: "Lendo dados de calibração..." });
    
    try {
        // Now we just need to read all registers, and the useEffect will update the state
        await readAllDeviceRegisters(deviceId);
        toast({ title: "Leituras Atualizadas!" });
    } catch (error: any) {
        toast({ title: "Erro ao Atualizar Leituras", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [isConnected, deviceId, readAllDeviceRegisters, toast]);

  useEffect(() => {
    if (deviceId) {
      const foundDevice = WhiteKonStorage.getById(deviceId);
      if (foundDevice) setDevice(foundDevice);
      else router.push("/whitekon/lista");
    }
  }, [deviceId, router]);

  const handleCalibrationModeToggle = async (checked: boolean) => {
    if (!deviceId) return;
    setIsLoading(true);
    try {
      const success = await writeDeviceRegister(deviceId, WhitekonRegisters.MODO_OPERACAO, checked ? 1 : 0);
      if (success) {
        setIsCalibrationModeActive(checked);
        toast({ title: checked ? "Modo Calibração Ativado" : "Modo Calibração Desativado" });
        // The useEffect for polling priority will handle the rest
      } else {
        toast({ title: "Erro", description: "Não foi possível alterar o modo de operação.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalibrateCommand = async (type: 'escuro' | 'claro') => {
    if (!isConnected || !deviceId) return;
    if (!isCalibrationModeActive) {
      toast({ title: "Modo Calibração Inativo", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const command = type === 'escuro' ? CalibrationCommands.CALIBRA_ESCURO : CalibrationCommands.CALIBRA_CLARO;
    
    try {
      await writeDeviceRegister(deviceId, WhitekonRegisters.COMANDOS_CALIBRACAO, 0);
      await new Promise(resolve => setTimeout(resolve, 200));

      const success = await writeDeviceRegister(deviceId, WhitekonRegisters.COMANDOS_CALIBRACAO, command);
      if (!success) throw new Error("Falha ao enviar comando de calibração");

      toast({ title: `Comando Enviado`, description: `Processando calibração ${type}...` });

      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadCalibrationScreenData();
      
      toast({ title: `Calibração ${type} Finalizada` });

    } catch (error: any) {
      toast({ title: "Erro na Calibração", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDebugCommand = async (command: "led" | "bobina", value: boolean) => {
    if (!isConnected || !isManualControlActive || !deviceId) return;
    
    setIsLoading(true);
    try {
      const currentValue = await readDeviceRegister(deviceId, WhitekonRegisters.CONTROLE_REMOTO) ?? 0;
      
      let newValue = currentValue;
      if (command === "led") {
        newValue = value ? (currentValue | 1) : (currentValue & ~1);
      } else if (command === "bobina") {
        newValue = value ? (currentValue | 2) : (currentValue & ~2);
      }
      
      const success = await writeDeviceRegister(deviceId, WhitekonRegisters.CONTROLE_REMOTO, newValue);
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const verifyValue = await readDeviceRegister(deviceId, WhitekonRegisters.CONTROLE_REMOTO);
        
        setLedStatus(verifyValue != null && (verifyValue & 1) === 1);
        setBobinStatus(verifyValue != null && (verifyValue & 2) === 2);
        toast({ title: `Comando ${command} ${value ? 'ativado' : 'desativado'}` });

      } else {
        throw new Error("Dispositivo não aceitou o comando");
      }
    } catch (error: any) {
      toast({ title: "Erro no Comando", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualControlToggle = async (checked: boolean) => {
    if (!deviceId) return;
    setIsLoading(true);
    const success = await writeDeviceRegister(deviceId, WhitekonRegisters.AUTOMATICO_MANUAL, checked ? 1 : 0);
    if (success) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await readAllDeviceRegisters(deviceId);
    } else {
      toast({ title: "Erro", description: "O dispositivo não aceitou o comando.", variant: "destructive" });
      await readAllDeviceRegisters(deviceId);
    }
    setIsLoading(false);
  };

  const handleEditInputChange = (field: keyof WhiteKonData, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!device) {
    return <div className="container mx-auto p-4 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <p className="text-gray-600">RTU: {device.rtuAddress} | {device.machineName}</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
          <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Conectado" : "Desconectado"}</Badge>
        </div>
      </div>

      <Tabs defaultValue="dispositivos" className="space-y-6" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dispositivos">Dispositivos</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="calibration">Calibração</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="registers">Registradores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dispositivos"><DashboardTab deviceId={deviceId} /></TabsContent>
        <TabsContent value="connection"><ConnectionTab device={device} /></TabsContent>

        <TabsContent value="parameters" className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Parâmetros de Operação</CardTitle>
                        <p className="text-sm text-muted-foreground">Configurações de leitura e correção do dispositivo.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={loadParametersFromDevice} variant="outline" size="sm" disabled={!isConnected || isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Carregar
                        </Button>
                        {isEditingParams ? (
                            <>
                                <Button onClick={() => setIsEditingParams(false)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancelar</Button>
                                <Button onClick={handleSaveParameters} size="sm" disabled={isLoading}><Save className="h-4 w-4 mr-2" />Salvar</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditingParams(true)} size="sm" disabled={!isConnected}><Edit className="h-4 w-4 mr-2" />Editar</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-4">
                        <h3 className="font-medium">Tempos</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between"><Label>Tempo LED Ligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedLigado ?? ''} onChange={(e) => handleEditInputChange('tempoLedLigado', e.target.value)} /> : <span className="font-mono">{registers?.[49] ?? '---'}</span>}</div>
                            <div className="flex items-center justify-between"><Label>Tempo LED Desligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedDesligado ?? ''} onChange={(e) => handleEditInputChange('tempoLedDesligado', e.target.value)} /> : <span className="font-mono">{registers?.[48] ?? '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-medium">Configurações de Leitura</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between"><Label>Tempo Integração:</Label>{isEditingParams ? <Select value={String(editValues.tempoIntegracao ?? '')} onValueChange={(v) => handleEditInputChange('tempoIntegracao', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{INTEGRATION_TIME_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{INTEGRATION_TIME_CODES.find(c => c.code === (registers?.[34] != null ? (registers[34] >> 8) & 0xff : null))?.value ?? '---'}</span>}</div>
                            <div className="flex items-center justify-between"><Label>Ganho:</Label>{isEditingParams ? <Select value={String(editValues.ganho ?? '')} onValueChange={(v) => handleEditInputChange('ganho', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{GAIN_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{GAIN_CODES.find(c => c.code === (registers?.[34] != null ? registers[34] & 0xff : null))?.value ?? '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-medium">Limites de Brancura</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between"><Label>Brancura Mínima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMinima ?? ''} onChange={(e) => handleEditInputChange('brancuraMinima', e.target.value)} /> : <span className="font-mono">{registers?.[53] != null ? (registers[53] / 10).toFixed(1) : '---'}</span>}</div>
                            <div className="flex items-center justify-between"><Label>Brancura Máxima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMaxima ?? ''} onChange={(e) => handleEditInputChange('brancuraMaxima', e.target.value)} /> : <span className="font-mono">{registers?.[54] != null ? (registers[54] / 10).toFixed(1) : '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4 md:col-span-2 lg:col-span-1">
                        <h3 className="font-medium">Correções</h3>
                        <div className="grid gap-3">
                           <div className="flex items-center justify-between"><Label>Offset:</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.offset ?? ''} onChange={(e) => handleEditInputChange('offset', e.target.value)} /> : <span className="font-mono">{registers?.[52] != null ? (registers[52] / 10).toFixed(1) : '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <h3 className="font-medium">Coeficientes de Correção de Brancura</h3>
                        <div className="grid gap-x-6 gap-y-3 md:grid-cols-3">
                           <div className="flex items-center justify-between"><Label>BRA.X²:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoA ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoA', e.target.value)} /> : <span className="font-mono">{registers?.[42] ?? '---'}</span>}</div>
                           <div className="flex items-center justify-between"><Label>BRA.X:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoB ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoB', e.target.value)} /> : <span className="font-mono">{registers?.[44] ?? '---'}</span>}</div>
                           <div className="flex items-center justify-between"><Label>BRA.C:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoC ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoC', e.target.value)} /> : <span className="font-mono">{registers?.[46] ?? '---'}</span>}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="calibration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calibração do Sensor de Brancura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="calibration-mode-switch" className="text-base font-medium">
                    Modo Calibração
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa o modo de calibração para o dispositivo.
                  </p>
                </div>
                <Switch
                  id="calibration-mode-switch"
                  checked={isCalibrationModeActive}
                  onCheckedChange={handleCalibrationModeToggle}
                  disabled={!isConnected || isLoading}
                />
              </div>

              {isCalibrationModeActive && (
                <div className="space-y-6 p-4 border rounded-lg bg-blue-50 animate-in fade-in-50">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-blue-800">Leituras e Comandos</h5>
                        <Button 
                          onClick={loadCalibrationScreenData} 
                          variant="outline" 
                          size="sm" 
                          disabled={isLoading}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                          Atualizar
                        </Button>
                      </div>
                      <div className="grid gap-3 text-sm mb-4">
                        <div className="flex justify-between items-center"><Label>Blue Preto:</Label><span className="font-mono px-2 py-1 rounded bg-gray-100">{calibrationScreenData.bluePreto ?? '---'}</span></div>
                        <div className="flex justify-between items-center"><Label>Blue Branco:</Label><span className="font-mono px-2 py-1 rounded bg-gray-100">{calibrationScreenData.blueBranco ?? '---'}</span></div>
                        <hr className="my-2" />
                        <div className="flex justify-between items-center"><Label>Blue Atual:</Label><span className="font-mono px-2 py-1 rounded bg-yellow-100 text-yellow-800">{calibrationScreenData.blue ?? '---'}</span></div>
                      </div>
                      <div className="space-y-3">
                        <Button onClick={() => handleCalibrateCommand('escuro')} disabled={isLoading} className="w-full bg-gray-700 hover:bg-gray-800">
                          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Calibrar Escuro
                        </Button>
                        <Button onClick={() => handleCalibrateCommand('claro')} disabled={isLoading} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300">
                          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Calibrar Claro
                        </Button>
                      </div>
                    </Card>

                    <CalibrationAlarms 
                      alarmRegisterValue={registers?.[WhitekonRegisters.ALARMES] ?? 0}
                    />
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h6 className="font-medium text-yellow-800 mb-2">Instruções de Calibração:</h6>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Posicionar a bolacha padrão escuro e clicar em "Calibrar Escuro".</li>
                      <li>Aguardar a confirmação.</li>
                      <li>Posicionar a bolacha padrão claro e clicar em "Calibrar Claro".</li>
                      <li>Aguardar a confirmação.</li>
                      <li>Sempre que calibrar uma, calibre a outra.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-center space-x-4 p-3 bg-blue-100 rounded-lg">
                     <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${calibrationScreenData.bluePreto != null && calibrationScreenData.bluePreto > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium">Escuro Calibrado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${calibrationScreenData.blueBranco != null && calibrationScreenData.blueBranco > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium">Claro Calibrado</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Debug e Controle Manual</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="manual-control-switch" className="text-base font-medium">Habilitar Controle Manual</Label>
                </div>
                <Switch
                  id="manual-control-switch"
                  checked={isManualControlActive}
                  onCheckedChange={handleManualControlToggle}
                  disabled={!isConnected || isLoading}
                />
              </div>

              {isManualControlActive && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 animate-in fade-in-50">
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-800">Controles Ativos</h4>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Controle LED</Label>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDebugCommand("led", true)} disabled={isLoading}>Ligar LED</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDebugCommand("led", false)} disabled={isLoading}>Desligar LED</Button>
                      </div>
                       <p className="text-xs text-gray-500">Status: {ledStatus ? "Ligado" : "Desligado"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Controle Bobina</Label>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDebugCommand("bobina", true)} disabled={isLoading}>Acionar Bobina</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDebugCommand("bobina", false)} disabled={isLoading}>Desligar Bobina</Button>
                      </div>
                       <p className="text-xs text-gray-500">Status: {bobinStatus ? "Acionada" : "Desligada"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registers"><RegistersTabReal deviceId={deviceId} /></TabsContent>
      </Tabs>
    </div>
  );
}