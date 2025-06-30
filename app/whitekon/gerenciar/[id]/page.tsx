// "use client"

// import { useState, useEffect, useCallback, useRef } from "react"
// import { useRouter, useParams } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Switch } from "@/components/ui/switch"
// import { WhiteKonStorage } from "@/lib/whitekon-storage"
// import { type WhiteKon, type WhiteKonData, INTEGRATION_TIME_CODES, GAIN_CODES } from "@/lib/types"
// import { CalibrationCommands, WhitekonRegisters } from "@/lib/whitekon-registers"
// import { useToast } from "@/hooks/use-toast"
// import { ArrowLeft, Wifi, WifiOff, Edit, Save, X, Loader2, RefreshCw } from "lucide-react"
// import { RegistersTabReal } from "@/components/registers-tab-real"
// import { DashboardTab } from "@/components/dashboard-tab"
// import { ConnectionTab } from "@/components/connection-tab"
// import { useWhitekon } from "@/contexts/whitekon-context"

// export default function GerenciarWhiteKonPage() {
//   const params = useParams()
//   const router = useRouter()
//   const { toast } = useToast()
//   const { isConnected, readRegister, writeRegister, readAllRegisters } = useWhitekon()

//   const [device, setDevice] = useState<WhiteKon | null>(null)
//   const [data, setData] = useState<WhiteKonData | null>(null)

//   const [isEditingParams, setIsEditingParams] = useState(false)
//   const [editValues, setEditValues] = useState<Partial<WhiteKonData>>({})

//   const [isManualControlActive, setIsManualControlActive] = useState(false)
//   const [ledStatus, setLedStatus] = useState(false)
//   const [bobinStatus, setBobinStatus] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [parametersLoaded, setParametersLoaded] = useState(false)

//   // Estados para calibração
//   const [isCalibrationModeActive, setIsCalibrationModeActive] = useState(false)
//   const [calibrationScreenData, setCalibrationScreenData] = useState({
//     bluePreto: null as number | null,
//     blueBranco: null as number | null,
//     brancuraSemCorrecao: null as number | null,
//     brancuraOnline: null as number | null,
//     blue: null as number | null,
//   })

//   // Estados para controle da atualização em tempo real
//   const [activeTab, setActiveTab] = useState("calibration")
//   const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
//   const [isRealTimeActive, setIsRealTimeActive] = useState(false)

//   const loadParametersFromDevice = useCallback(async () => {
//     if (!isConnected) {
//       toast({ title: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }
//     setIsLoading(true);
//     toast({ title: "Lendo parâmetros da placa..." });
//     try {
//       const registers = await readAllRegisters();

//       const loadedData: WhiteKonData = {
//         tempoLedLigado: registers[49],
//         tempoLedDesligado: registers[48],
//         tempoIntegracao: registers[34] !== null ? (registers[34] >> 8) & 0xff : null,
//         ganho: registers[34] !== null ? registers[34] & 0xff : null,
//         brancuraMinima: registers[53] !== null ? registers[53] / 10.0 : null,
//         brancuraMaxima: registers[54] !== null ? registers[54] / 10.0 : null,
//         offset: registers[52] !== null ? registers[52] / 10.0 : null,
//         coefACorrecaoA: registers[42],
//         coefACorrecaoB: registers[44],
//         coefACorrecaoC: registers[46],
//         modoOperacao: registers[0],
//         automaticoManual: registers[29],
//         controleRemoto: registers[28],
//         brancuraMedia: null, brancuraOnline: null, brancuraSemCorrecao: null, desvPadrao: null, tempCalibracao: null, tempOnline: null, red: null, green: null, blue: null, clear: null, bluePreto: null, blueBranco: null, contadorAmostras: null, alarmes: null, valorEscuroPadrao: null, valorClaroPadrao: null, escuroMaximo: null, claroMinimo: null, coefATempA: null, coefATempB: null, coefATempC: null,
//       };

//       setData(loadedData);
//       setEditValues(loadedData);
//       setParametersLoaded(true);
      
//       setIsManualControlActive(registers[29] === 1);
//       setLedStatus(registers[28] !== null && (registers[28] & 1) === 1);
//       setBobinStatus(registers[28] !== null && (registers[28] & 2) === 2);
      
//       // Verificar se está em modo calibração
//       setIsCalibrationModeActive(registers[0] === 1);
      
//       toast({ title: "Parâmetros sincronizados com o dispositivo!" });
//     } catch (error: any) {
//       toast({ title: "Erro ao Sincronizar", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isConnected, readAllRegisters, toast]);

//   const handleSaveParameters = async () => {
//     setIsLoading(true);
//     toast({ title: "Salvando parâmetros no dispositivo..." });
//     try {
//         const updates: { register: number; value: number }[] = [];

//         if (editValues.tempoLedLigado !== null) updates.push({ register: 49, value: Number(editValues.tempoLedLigado) });
//         if (editValues.tempoLedDesligado !== null) updates.push({ register: 48, value: Number(editValues.tempoLedDesligado) });
//         if (editValues.brancuraMinima !== null) updates.push({ register: 53, value: Math.round(Number(editValues.brancuraMinima) * 10) });
//         if (editValues.brancuraMaxima !== null) updates.push({ register: 54, value: Math.round(Number(editValues.brancuraMaxima) * 10) });
//         if (editValues.offset !== null) updates.push({ register: 52, value: Math.round(Number(editValues.offset) * 10) });
//         if (editValues.coefACorrecaoA !== null) updates.push({ register: 42, value: Number(editValues.coefACorrecaoA) });
//         if (editValues.coefACorrecaoB !== null) updates.push({ register: 44, value: Number(editValues.coefACorrecaoB) });
//         if (editValues.coefACorrecaoC !== null) updates.push({ register: 46, value: Number(editValues.coefACorrecaoC) });
        
//         const tempo = editValues.tempoIntegracao ?? data?.tempoIntegracao ?? 0;
//         const ganho = editValues.ganho ?? data?.ganho ?? 0;
//         updates.push({ register: 34, value: (tempo << 8) | ganho });

//         let successCount = 0;
//         for (const update of updates) {
//             if (await writeRegister(update.register, update.value)) {
//                 successCount++;
//             }
//         }

//         if (successCount === updates.length) {
//             toast({ title: "Sucesso!", description: "Todos os parâmetros foram salvos." });
//         } else {
//             toast({ title: "Atenção", description: `${successCount} de ${updates.length} parâmetros foram salvos.`, variant: "destructive" });
//         }

//         setIsEditingParams(false);
//         await loadParametersFromDevice(); 

//     } catch (error: any) {
//         toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
//     } finally {
//         setIsLoading(false);
//     }
//   };

//   // Função para atualizar APENAS o Blue Atual (Reg. 17) em tempo real
//   const updateBlueAtualRealTime = useCallback(async () => {
//     if (!isConnected || activeTab !== "calibration" || !isCalibrationModeActive) {
//       return;
//     }
    
//     try {
//       const blueValue = await readRegister(WhitekonRegisters.BLUE); // Registro 17
//       setCalibrationScreenData(prev => ({ 
//         ...prev, 
//         blue: blueValue 
//       }));
//     } catch (error) {
//       // Silenciar erros de tempo real para não sobrecarregar o toast
//       console.error("Erro na atualização em tempo real do Blue Atual:", error);
//     }
//   }, [isConnected, activeTab, isCalibrationModeActive, readRegister]);

//   // VERSÃO COM DEBUG DETALHADO
//   const loadCalibrationScreenData = useCallback(async () => {
//     if (!isConnected) {
//       toast({ title: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }
    
//     setIsLoading(true);
//     toast({ title: "Atualizando leituras de calibração..." });
    
//     try {
//       console.log("🔍 INICIANDO LEITURA DOS REGISTROS...");
      
//       // Ler registros individualmente para debug
//       const reg8 = await readRegister(8);   // Blue Preto
//       console.log("📊 Registro 8 (Blue Preto):", reg8, typeof reg8);
      
//       const reg9 = await readRegister(9);   // Blue Branco  
//       console.log("📊 Registro 9 (Blue Branco):", reg9, typeof reg9);
      
//       const reg17 = await readRegister(17);  // Blue Atual
//       console.log("📊 Registro 17 (Blue Atual):", reg17, typeof reg17);
      
//       const reg20 = await readRegister(20);  // Brancura s/ Correção
//       console.log("📊 Registro 20 (Brancura s/ Correção):", reg20, typeof reg20);
      
//       const reg21 = await readRegister(21);  // Brancura Online
//       console.log("📊 Registro 21 (Brancura Online):", reg21, typeof reg21);

//       // Processar dados com validação extra
//       const processedData = {
//         bluePreto: reg8,
//         blueBranco: reg9,
//         blue: reg17,
//         brancuraSemCorrecao: reg20 !== null && reg20 !== undefined && !isNaN(reg20) ? reg20 / 10.0 : null,
//         brancuraOnline: reg21 !== null && reg21 !== undefined && !isNaN(reg21) ? reg21 / 10.0 : null,
//       };
      
//       console.log("🎯 DADOS PROCESSADOS:", processedData);

//       setCalibrationScreenData(processedData);

//       toast({ 
//         title: "Leituras Atualizadas!", 
//         description: `Registros lidos: ${[reg8, reg9, reg17, reg20, reg21].filter(v => v !== null).length}/5` 
//       });

//     } catch (error: any) {
//       console.error("❌ ERRO DETALHADO:", error);
//       toast({ 
//         title: "Erro ao Atualizar Leituras", 
//         description: `Falha: ${error.message}`, 
//         variant: "destructive" 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isConnected, readRegister, toast]);

//   // Controlar atualização em tempo real baseado na aba ativa e modo calibração
//   useEffect(() => {
//     // Limpar interval anterior se existir
//     if (realTimeIntervalRef.current) {
//       clearInterval(realTimeIntervalRef.current);
//       realTimeIntervalRef.current = null;
//       setIsRealTimeActive(false);
//     }

//     // Iniciar tempo real apenas se todas as condições forem atendidas
//     if (activeTab === "calibration" && isConnected && isCalibrationModeActive) {
//       setIsRealTimeActive(true);
//       realTimeIntervalRef.current = setInterval(updateBlueAtualRealTime, 1000); // 1 segundo
      
//       // Fazer primeira leitura imediatamente
//       updateBlueAtualRealTime();
//     }

//     // Cleanup function
//     return () => {
//       if (realTimeIntervalRef.current) {
//         clearInterval(realTimeIntervalRef.current);
//         realTimeIntervalRef.current = null;
//       }
//     };
//   }, [activeTab, isConnected, isCalibrationModeActive, updateBlueAtualRealTime]);

//   // Cleanup geral quando componente desmonta
//   useEffect(() => {
//     return () => {
//       if (realTimeIntervalRef.current) {
//         clearInterval(realTimeIntervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (params.id) {
//       const device = WhiteKonStorage.getById(params.id as string);
//       if (device) setDevice(device);
//       else router.push("/whitekon/lista");
//     }
//   }, [params.id, router]);

//   useEffect(() => {
//     if (isConnected && !parametersLoaded) {
//       loadParametersFromDevice();
//     }
//     if (!isConnected) {
//       setParametersLoaded(false);
//       setIsManualControlActive(false);
//       setIsCalibrationModeActive(false);
//       setIsRealTimeActive(false);
//     }
//   }, [isConnected, parametersLoaded, loadParametersFromDevice]);

//   const handleCalibrationModeToggle = async (checked: boolean) => {
//     setIsLoading(true);
//     try {
//       const success = await writeRegister(WhitekonRegisters.MODO_OPERACAO, checked ? 1 : 0);
//       if (success) {
//         setIsCalibrationModeActive(checked);
//         toast({ 
//           title: checked ? "Modo Calibração Ativado" : "Modo Calibração Desativado",
//           description: checked ? "Registro 0 = 1 (Calibração)" : "Registro 0 = 0 (Normal)"
//         });
        
//         // Se ativou o modo, carrega as leituras automaticamente
//         if (checked) {
//           await new Promise(resolve => setTimeout(resolve, 500));
//           await loadCalibrationScreenData();
//         }
//       } else {
//         toast({ title: "Erro", description: "Não foi possível alterar o modo de operação.", variant: "destructive" });
//       }
//     } catch (error: any) {
//       toast({ title: "Erro", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCalibrateCommand = async (type: 'escuro' | 'claro') => {
//     if (!isConnected) {
//       toast({ title: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }

//     if (!isCalibrationModeActive) {
//       toast({ 
//         title: "Modo Calibração Inativo", 
//         description: "Ative o Modo Calibração primeiro (botão verde).", 
//         variant: "destructive" 
//       });
//       return;
//     }

//     setIsLoading(true);
    
//     // Usar as constantes corretas do arquivo whitekon-registers
//     const command = type === 'escuro' ? CalibrationCommands.CALIBRA_ESCURO : CalibrationCommands.CALIBRA_CLARO;
    
//     try {
//       // Verificar se o registro 27 está em 0
//       const currentReg27 = await readRegister(WhitekonRegisters.COMANDOS_CALIBRACAO);
      
//       if (currentReg27 !== 0) {
//         toast({ 
//           title: "Preparando Registro de Comando", 
//           description: `Registro 27 = ${currentReg27}, zerando para aceitar novo comando...`
//         });
        
//         // Escrever 0 no registro 27 primeiro
//         const resetSuccess = await writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, 0);
        
//         if (!resetSuccess) {
//           throw new Error("Falha ao zerar o registro 27");
//         }
        
//         // Aguardar um pouco para o hardware processar
//         await new Promise(resolve => setTimeout(resolve, 500));
        
//         // Verificar se realmente foi zerado
//         const verifyReg27 = await readRegister(WhitekonRegisters.COMANDOS_CALIBRACAO);
//         if (verifyReg27 !== 0) {
//           throw new Error(`Registro 27 não foi zerado corretamente. Valor atual: ${verifyReg27}`);
//         }
        
//         toast({ 
//           title: "Registro Preparado", 
//           description: "Registro 27 zerado com sucesso. Enviando comando de calibração..."
//         });
//       }

//       toast({ 
//         title: `Enviando Comando de Calibração ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
//         description: `Comando: 0x${command.toString(16).toUpperCase()} → Registro 27`
//       });

//       // Enviar o comando para o registro 27
//       const success = await writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, command);
      
//       if (!success) {
//         throw new Error("Falha ao enviar comando de calibração");
//       }

//       toast({ 
//         title: `Comando Enviado`, 
//         description: `O dispositivo está processando a calibração ${type}...` 
//       });

//       // Aguardar o dispositivo processar
//       await new Promise(resolve => setTimeout(resolve, 3000));
      
//       // Atualizar as leituras para ver os novos valores
//       await loadCalibrationScreenData();
      
//       toast({ 
//         title: `Calibração ${type.charAt(0).toUpperCase() + type.slice(1)} Finalizada`, 
//         description: "Verifique os novos valores nas leituras de calibração."
//       });

//     } catch (error: any) {
//       toast({ 
//         title: "Erro na Calibração", 
//         description: error.message, 
//         variant: "destructive" 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDebugCommand = async (command: "led" | "bobina", value: boolean) => {
//     if (!isConnected || !isManualControlActive) {
//       toast({ 
//         title: "Controle Manual Inativo", 
//         description: "Habilite o Controle Manual.", 
//         variant: "destructive" 
//       });
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const currentValue = await readRegister(WhitekonRegisters.CONTROLE_REMOTO);
//       if (currentValue === null) {
//         throw new Error("Não foi possível ler o estado do controle");
//       }
      
//       let newValue = currentValue;
//       if (command === "led") {
//         newValue = value ? (currentValue | 1) : (currentValue & ~1);
//       } else if (command === "bobina") {
//         newValue = value ? (currentValue | 2) : (currentValue & ~2);
//       }
      
//       const success = await writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue);
//       if (success) {
//         // Aguardar um pouco e verificar se o comando foi aceito
//         await new Promise(resolve => setTimeout(resolve, 500));
//         const verifyValue = await readRegister(WhitekonRegisters.CONTROLE_REMOTO);
        
//         if (command === "led") {
//           const ledState = verifyValue !== null && (verifyValue & 1) === 1;
//           setLedStatus(ledState);
//           toast({ 
//             title: `LED ${value ? 'Ligado' : 'Desligado'}`, 
//             description: `Estado atual: ${ledState ? 'Ligado' : 'Desligado'}` 
//           });
//         }
//         if (command === "bobina") {
//           const bobinState = verifyValue !== null && (verifyValue & 2) === 2;
//           setBobinStatus(bobinState);
//           toast({ 
//             title: `Bobina ${value ? 'Acionada' : 'Desligada'}`, 
//             description: `Estado atual: ${bobinState ? 'Acionada' : 'Desligada'}` 
//           });
//         }
//       } else {
//         throw new Error("Dispositivo não aceitou o comando");
//       }
//     } catch (error: any) {
//       toast({ 
//         title: "Erro no Comando", 
//         description: error.message, 
//         variant: "destructive" 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleManualControlToggle = async (checked: boolean) => {
//     setIsLoading(true);
//     const success = await writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, checked ? 1 : 0);
//     if (success) {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       await loadParametersFromDevice();
//     } else {
//       toast({ title: "Erro", description: "O dispositivo não aceitou o comando.", variant: "destructive" });
//       await loadParametersFromDevice();
//     }
//     setIsLoading(false);
//   };

//   const handleEditInputChange = (field: keyof WhiteKonData, value: string) => {
//     setEditValues(prev => ({ ...prev, [field]: value }));
//   };

//   // Função para controlar mudança de aba
//   const handleTabChange = (value: string) => {
//     setActiveTab(value);
//   };

//   if (!device) {
//     return <div className="container mx-auto p-4 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center gap-4 mb-6">
//         <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold">{device.name}</h1>
//           <p className="text-gray-600">RTU: {device.rtuAddress} | {device.machineName}</p>
//         </div>
//         <div className="flex items-center gap-2">
//           {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
//           <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Conectado" : "Desconectado"}</Badge>
//         </div>
//       </div>

//       <Tabs defaultValue="calibration" className="space-y-6" onValueChange={handleTabChange}>
//         <TabsList className="grid w-full grid-cols-6">
//           <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
//           <TabsTrigger value="connection">Conexão</TabsTrigger>
//           <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
//           <TabsTrigger value="calibration">Calibração</TabsTrigger>
//           <TabsTrigger value="debug">Debug</TabsTrigger>
//           <TabsTrigger value="registers">Registradores</TabsTrigger>
//         </TabsList>
       
//         <TabsContent value="dashboard"><DashboardTab activeWhitekon={device.rtuAddress} onWhitekonChangeAction={() => {}} /></TabsContent>
//         <TabsContent value="connection"><ConnectionTab /></TabsContent>

//         <TabsContent value="parameters" className="space-y-6">
//             <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <div>
//                         <CardTitle>Parâmetros de Operação</CardTitle>
//                         <p className="text-sm text-muted-foreground">Configurações de leitura e correção do dispositivo.</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button onClick={loadParametersFromDevice} variant="outline" size="sm" disabled={!isConnected || isLoading}>
//                             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//                             Carregar
//                         </Button>
//                         {isEditingParams ? (
//                             <>
//                                 <Button onClick={() => setIsEditingParams(false)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancelar</Button>
//                                 <Button onClick={handleSaveParameters} size="sm" disabled={isLoading}><Save className="h-4 w-4 mr-2" />Salvar</Button>
//                             </>
//                         ) : (
//                             <Button onClick={() => setIsEditingParams(true)} size="sm" disabled={!isConnected}><Edit className="h-4 w-4 mr-2" />Editar</Button>
//                         )}
//                     </div>
//                 </CardHeader>
//                 <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//                     <div className="space-y-4">
//                         <h3 className="font-medium">Tempos</h3>
//                         <div className="grid gap-3">
//                             <div className="flex items-center justify-between"><Label>Tempo LED Ligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedLigado ?? ''} onChange={(e) => handleEditInputChange('tempoLedLigado', e.target.value)} /> : <span className="font-mono">{data?.tempoLedLigado ?? '---'}</span>}</div>
//                             <div className="flex items-center justify-between"><Label>Tempo LED Desligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedDesligado ?? ''} onChange={(e) => handleEditInputChange('tempoLedDesligado', e.target.value)} /> : <span className="font-mono">{data?.tempoLedDesligado ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4">
//                         <h3 className="font-medium">Configurações de Leitura</h3>
//                         <div className="grid gap-3">
//                             <div className="flex items-center justify-between"><Label>Tempo Integração:</Label>{isEditingParams ? <Select value={String(editValues.tempoIntegracao ?? '')} onValueChange={(v) => handleEditInputChange('tempoIntegracao', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{INTEGRATION_TIME_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{INTEGRATION_TIME_CODES.find(c => c.code === data?.tempoIntegracao)?.value ?? '---'}</span>}</div>
//                             <div className="flex items-center justify-between"><Label>Ganho:</Label>{isEditingParams ? <Select value={String(editValues.ganho ?? '')} onValueChange={(v) => handleEditInputChange('ganho', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{GAIN_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{GAIN_CODES.find(c => c.code === data?.ganho)?.value ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4">
//                         <h3 className="font-medium">Limites de Brancura</h3>
//                         <div className="grid gap-3">
//                             <div className="flex items-center justify-between"><Label>Brancura Mínima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMinima ?? ''} onChange={(e) => handleEditInputChange('brancuraMinima', e.target.value)} /> : <span className="font-mono">{data?.brancuraMinima?.toFixed(1) ?? '---'}</span>}</div>
//                             <div className="flex items-center justify-between"><Label>Brancura Máxima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMaxima ?? ''} onChange={(e) => handleEditInputChange('brancuraMaxima', e.target.value)} /> : <span className="font-mono">{data?.brancuraMaxima?.toFixed(1) ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4 md:col-span-2 lg:col-span-1">
//                         <h3 className="font-medium">Correções</h3>
//                         <div className="grid gap-3">
//                            <div className="flex items-center justify-between"><Label>Offset:</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.offset ?? ''} onChange={(e) => handleEditInputChange('offset', e.target.value)} /> : <span className="font-mono">{data?.offset?.toFixed(1) ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4 md:col-span-2">
//                         <h3 className="font-medium">Coeficientes de Correção de Brancura</h3>
//                         <div className="grid gap-x-6 gap-y-3 md:grid-cols-3">
//                            <div className="flex items-center justify-between"><Label>BRA.X²:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoA ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoA', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoA ?? '---'}</span>}</div>
//                            <div className="flex items-center justify-between"><Label>BRA.X:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoB ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoB', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoB ?? '---'}</span>}</div>
//                            <div className="flex items-center justify-between"><Label>BRA.C:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoC ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoC', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoC ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </TabsContent>

//         <TabsContent value="calibration" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Calibração do Sensor de Brancura</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Switch do Modo Calibração */}
//               <div className="flex items-center justify-between p-4 border rounded-lg">
//                 <div>
//                   <Label htmlFor="calibration-mode-switch" className="text-base font-medium">
//                     Modo Calibração
//                   </Label>
//                   <p className="text-sm text-muted-foreground">
//                     Ativa o modo de calibração para o dispositivo.
//                   </p>
//                 </div>
//                 <Switch
//                   id="calibration-mode-switch"
//                   checked={isCalibrationModeActive}
//                   onCheckedChange={handleCalibrationModeToggle}
//                   disabled={!isConnected || isLoading}
//                 />
//               </div>

//               {/* Conteúdo do Modo Calibração */}
//               {isCalibrationModeActive && (
//                 <div className="space-y-6 p-4 border rounded-lg bg-blue-50 animate-in fade-in-50">
                  
//                   {/* Leituras Atuais */}
//                   <div className="grid gap-6 md:grid-cols-2">
//                     <Card className="p-4">
//                       <div className="flex items-center justify-between mb-4">
//                         <h5 className="font-medium text-blue-800">Leituras de Calibração</h5>
//                         <Button 
//                           onClick={loadCalibrationScreenData} 
//                           variant="outline" 
//                           size="sm" 
//                           disabled={isLoading}
//                         >
//                           <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//                           Atualizar Leituras
//                         </Button>
//                       </div>
//                       <div className="grid gap-3 text-sm">
//                         <div className="flex justify-between items-center">
//                           <Label>Blue Preto:</Label>
//                           <span className={`font-mono px-2 py-1 rounded ${
//                             calibrationScreenData.bluePreto !== null ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
//                           }`}>
//                             {calibrationScreenData.bluePreto ?? '---'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center">
//                           <Label>Blue Branco:</Label>
//                           <span className={`font-mono px-2 py-1 rounded ${
//                             calibrationScreenData.blueBranco !== null ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
//                           }`}>
//                             {calibrationScreenData.blueBranco ?? '---'}
//                           </span>
//                         </div>
                        
//                         <hr className="my-2" />
                        
//                         <div className="flex justify-between items-center">
//                           <Label>Brancura s/ Correção:</Label>
//                           <span className="font-mono px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                             {calibrationScreenData.brancuraSemCorrecao?.toFixed(1) ?? '---'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center">
//                           <Label>Brancura Online:</Label>
//                           <span className="font-mono px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                             {calibrationScreenData.brancuraOnline?.toFixed(1) ?? '---'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center font-bold">
//                           <Label>Blue Atual:</Label>
//                           <div className="flex items-center gap-2">
//                             <span className="font-mono px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
//                               {calibrationScreenData.blue ?? '---'}
//                             </span>
//                             {isRealTimeActive && (
//                               <div className="flex items-center gap-1">
//                                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                                 <span className="text-xs text-green-600 font-semibold">TEMPO REAL</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
                      
//                       {/* Status do Tempo Real */}
//                       <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-xs">
//                         <div className="flex items-center justify-between">
//                           <span className="text-green-700">Status Tempo Real:</span>
//                           <span className={`font-semibold ${isRealTimeActive ? 'text-green-600' : 'text-gray-500'}`}>
//                             {isRealTimeActive ? '✓ ATIVO (1s)' : '⏸ INATIVO'}
//                           </span>
//                         </div>
//                       </div>
//                     </Card>

//                     {/* Comandos de Calibração */}
//                     <Card className="p-4">
//                       <h5 className="font-medium text-blue-800 mb-4">Comandos de Calibração</h5>
//                       <div className="space-y-3">
//                         <Button 
//                           onClick={() => handleCalibrateCommand('escuro')} 
//                           disabled={isLoading} 
//                           className="w-full bg-gray-700 hover:bg-gray-800"
//                         >
//                           {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
//                           Calibrar Bolacha Escura
//                         </Button>
                        
//                         <Button 
//                           onClick={() => handleCalibrateCommand('claro')} 
//                           disabled={isLoading} 
//                           className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
//                         >
//                           {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
//                           Calibrar Bolacha Clara
//                         </Button>
//                       </div>
//                     </Card>
//                   </div>

//                   {/* Instruções */}
//                   <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <h6 className="font-medium text-yellow-800 mb-2">Instruções de Calibração das Bolachas:</h6>
//                     <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
//                       <li><strong>Clicar no botão "Atualizar Leituras" para verificar os valores atuais</strong></li>
//                       <li><strong>Posicionar a Bolacha padrão escuro na frente do sensor e clicar "Calibrar Escuro"</strong></li>
//                       <li><strong>Esperar a mensagem de confirmação, "Calibração Escuro Finalizada" </strong></li>
//                       <li><strong>Posicionar a Bolacha padrão claro na frente do sensor e clicar "Calibrar Claro"</strong></li>
//                       <li><strong>Esperar a mensagem de confirmação, "Calibração Claro Finalizada" </strong></li>
//                     </ul>
//                   </div>

//                   {/* Status da Calibração */}
//                   <div className="flex items-center justify-center space-x-4 p-3 bg-blue-100 rounded-lg">
//                     <div className="flex items-center space-x-2">
//                       <div className={`w-3 h-3 rounded-full ${
//                         calibrationScreenData.bluePreto !== null && calibrationScreenData.bluePreto > 0 ? 'bg-green-500' : 'bg-gray-300'
//                       }`} />
//                       <span className="text-sm font-medium">Escuro Calibrado</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <div className={`w-3 h-3 rounded-full ${
//                         calibrationScreenData.blueBranco !== null && calibrationScreenData.blueBranco > 0 ? 'bg-green-500' : 'bg-gray-300'
//                       }`} />
//                       <span className="text-sm font-medium">Claro Calibrado</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="debug" className="space-y-6">
//           <Card>
//             <CardHeader><CardTitle>Debug e Controle Manual</CardTitle></CardHeader>
//             <CardContent className="space-y-6">
//               <div className="flex items-center justify-between p-4 border rounded-lg">
//                 <div>
//                   <Label htmlFor="manual-control-switch" className="text-base font-medium">Habilitar Controle Manual</Label>
//                 </div>
//                 <Switch
//                   id="manual-control-switch"
//                   checked={isManualControlActive}
//                   onCheckedChange={handleManualControlToggle}
//                   disabled={!isConnected || isLoading}
//                 />
//               </div>

//               {isManualControlActive && (
//                 <div className="space-y-4 p-4 border rounded-lg bg-gray-50 animate-in fade-in-50">
//                   <div className="mb-4">
//                     <h4 className="font-medium text-blue-800">Controles Ativos</h4>
//                   </div>
//                   <div className="grid gap-6 md:grid-cols-2">
//                     <div className="space-y-2">
//                       <Label>Controle LED</Label>
//                       <div className="flex gap-2">
//                         <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDebugCommand("led", true)} disabled={isLoading}>Ligar LED</Button>
//                         <Button size="sm" variant="destructive" onClick={() => handleDebugCommand("led", false)} disabled={isLoading}>Desligar LED</Button>
//                       </div>
//                        <p className="text-xs text-gray-500">Status: {ledStatus ? "Ligado" : "Desligado"}</p>
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Controle Bobina</Label>
//                       <div className="flex gap-2">
//                         <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDebugCommand("bobina", true)} disabled={isLoading}>Acionar Bobina</Button>
//                         <Button size="sm" variant="destructive" onClick={() => handleDebugCommand("bobina", false)} disabled={isLoading}>Desligar Bobina</Button>
//                       </div>
//                        <p className="text-xs text-gray-500">Status: {bobinStatus ? "Acionada" : "Desligada"}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="registers"><RegistersTabReal deviceId={device.id} /></TabsContent>
//       </Tabs>
//     </div>
//   );
// } 










// "use client"

// import { useState, useEffect, useCallback, useRef } from "react"
// import { useRouter, useParams } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Switch } from "@/components/ui/switch"
// import { WhiteKonStorage } from "@/lib/whitekon-storage"
// import { type WhiteKon, type WhiteKonData, INTEGRATION_TIME_CODES, GAIN_CODES, ALARM_TYPES } from "@/lib/types"
// import { CalibrationCommands, WhitekonRegisters } from "@/lib/whitekon-registers"
// import { useToast } from "@/hooks/use-toast"
// import { ArrowLeft, Wifi, WifiOff, Edit, Save, X, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
// import { RegistersTabReal } from "@/components/registers-tab-real"
// import { DashboardTab } from "@/components/dashboard-tab"
// import { ConnectionTab } from "@/components/connection-tab"
// import { useWhitekon } from "@/contexts/whitekon-context"

// // --- NOVO COMPONENTE DE ALARMES DE CALIBRAÇÃO ---
// const CalibrationAlarms = () => {
//   const { whitekonData } = useWhitekon();
//   // O registrador de alarmes é o de endereço 10.
//   const alarmRegisterValue = whitekonData?.registers?.[WhitekonRegisters.ALARMES] ?? 0;

//   const calibrationAlarms = ALARM_TYPES.filter(alarm => alarm.type === "CALIBRAÇÃO");

//   const getActiveAlarms = () => {
//     // Verifica cada bit de alarme para ver se está ativo
//     return calibrationAlarms.filter(alarm => (alarmRegisterValue >> alarm.bit) & 1);
//   };

//   const activeAlarms = getActiveAlarms();

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <AlertTriangle className="h-5 w-5 text-destructive" />
//           Alarmes de Calibração Ativos
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         {activeAlarms.length > 0 ? (
//           <div className="space-y-2">
//             {activeAlarms.map((alarm) => (
//               <div
//                 key={alarm.bit}
//                 className="p-3 border rounded-md bg-destructive/10 border-destructive/20 flex justify-between items-center"
//               >
//                 <p className="font-medium text-destructive">{alarm.description}</p>
//                 <Badge variant="destructive">Bit: {alarm.bit}</Badge>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-6 text-muted-foreground">
//             Nenhum alarme de calibração ativo.
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };
// // --- FIM DO NOVO COMPONENTE ---

// export default function GerenciarWhiteKonPage() {
//   const params = useParams()
//   const router = useRouter()
//   const { toast } = useToast()
//   const { isConnected, readRegister, writeRegister, readAllRegisters, whitekonData } = useWhitekon()

//   const [device, setDevice] = useState<WhiteKon | null>(null)
//   const [data, setData] = useState<WhiteKonData | null>(null)

//   const [isEditingParams, setIsEditingParams] = useState(false)
//   const [editValues, setEditValues] = useState<Partial<WhiteKonData>>({})

//   const [isManualControlActive, setIsManualControlActive] = useState(false)
//   const [ledStatus, setLedStatus] = useState(false)
//   const [bobinStatus, setBobinStatus] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [parametersLoaded, setParametersLoaded] = useState(false)

//   // Estados para calibração
//   const [isCalibrationModeActive, setIsCalibrationModeActive] = useState(false)
//   const [calibrationScreenData, setCalibrationScreenData] = useState({
//     bluePreto: null as number | null,
//     blueBranco: null as number | null,
//     brancuraSemCorrecao: null as number | null,
//     brancuraOnline: null as number | null,
//     blue: null as number | null,
//   })

//   // Estados para controle da atualização em tempo real
//   const [activeTab, setActiveTab] = useState("calibration")
//   const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
//   const [isRealTimeActive, setIsRealTimeActive] = useState(false)

//   const loadParametersFromDevice = useCallback(async () => {
//     if (!isConnected) {
//       toast({ title: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }
//     setIsLoading(true);
//     toast({ title: "Lendo parâmetros da placa..." });
//     try {
//       const registers = await readAllRegisters();

//       const loadedData: WhiteKonData = {
//         tempoLedLigado: registers[49],
//         tempoLedDesligado: registers[48],
//         tempoIntegracao: registers[34] !== null ? (registers[34] >> 8) & 0xff : null,
//         ganho: registers[34] !== null ? registers[34] & 0xff : null,
//         brancuraMinima: registers[53] !== null ? registers[53] / 10.0 : null,
//         brancuraMaxima: registers[54] !== null ? registers[54] / 10.0 : null,
//         offset: registers[52] !== null ? registers[52] / 10.0 : null,
//         coefACorrecaoA: registers[42],
//         coefACorrecaoB: registers[44],
//         coefACorrecaoC: registers[46],
//         modoOperacao: registers[0],
//         automaticoManual: registers[29],
//         controleRemoto: registers[28],
//         brancuraMedia: null, brancuraOnline: null, brancuraSemCorrecao: null, desvPadrao: null, tempCalibracao: null, tempOnline: null, red: null, green: null, blue: null, clear: null, bluePreto: null, blueBranco: null, contadorAmostras: null, alarmes: null, valorEscuroPadrao: null, valorClaroPadrao: null, escuroMaximo: null, claroMinimo: null, coefATempA: null, coefATempB: null, coefATempC: null,
//       };

//       setData(loadedData);
//       setEditValues(loadedData);
//       setParametersLoaded(true);
      
//       setIsManualControlActive(registers[29] === 1);
//       setLedStatus(registers[28] !== null && (registers[28] & 1) === 1);
//       setBobinStatus(registers[28] !== null && (registers[28] & 2) === 2);
      
//       // Verificar se está em modo calibração
//       setIsCalibrationModeActive(registers[0] === 1);
      
//       toast({ title: "Parâmetros sincronizados com o dispositivo!" });
//     } catch (error: any) {
//       toast({ title: "Erro ao Sincronizar", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isConnected, readAllRegisters, toast]);

//   const handleSaveParameters = async () => {
//     setIsLoading(true);
//     toast({ title: "Salvando parâmetros no dispositivo..." });
//     try {
//         const updates: { register: number; value: number }[] = [];

//         if (editValues.tempoLedLigado !== null) updates.push({ register: 49, value: Number(editValues.tempoLedLigado) });
//         if (editValues.tempoLedDesligado !== null) updates.push({ register: 48, value: Number(editValues.tempoLedDesligado) });
//         if (editValues.brancuraMinima !== null) updates.push({ register: 53, value: Math.round(Number(editValues.brancuraMinima) * 10) });
//         if (editValues.brancuraMaxima !== null) updates.push({ register: 54, value: Math.round(Number(editValues.brancuraMaxima) * 10) });
//         if (editValues.offset !== null) updates.push({ register: 52, value: Math.round(Number(editValues.offset) * 10) });
//         if (editValues.coefACorrecaoA !== null) updates.push({ register: 42, value: Number(editValues.coefACorrecaoA) });
//         if (editValues.coefACorrecaoB !== null) updates.push({ register: 44, value: Number(editValues.coefACorrecaoB) });
//         if (editValues.coefACorrecaoC !== null) updates.push({ register: 46, value: Number(editValues.coefACorrecaoC) });
        
//         const tempo = editValues.tempoIntegracao ?? data?.tempoIntegracao ?? 0;
//         const ganho = editValues.ganho ?? data?.ganho ?? 0;
//         updates.push({ register: 34, value: (tempo << 8) | ganho });

//         let successCount = 0;
//         for (const update of updates) {
//             if (await writeRegister(update.register, update.value)) {
//                 successCount++;
//             }
//         }

//         if (successCount === updates.length) {
//             toast({ title: "Sucesso!", description: "Todos os parâmetros foram salvos." });
//         } else {
//             toast({ title: "Atenção", description: `${successCount} de ${updates.length} parâmetros foram salvos.`, variant: "destructive" });
//         }

//         setIsEditingParams(false);
//         await loadParametersFromDevice(); 

//     } catch (error: any) {
//         toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
//     } finally {
//         setIsLoading(false);
//     }
//   };

//   const updateBlueAtualRealTime = useCallback(async () => {
//     if (!isConnected || activeTab !== "calibration" || !isCalibrationModeActive) {
//       return;
//     }
    
//     try {
//       const blueValue = await readRegister(WhitekonRegisters.BLUE); 
//       setCalibrationScreenData(prev => ({ 
//         ...prev, 
//         blue: blueValue 
//       }));
//     } catch (error) {
//       console.error("Erro na atualização em tempo real do Blue Atual:", error);
//     }
//   }, [isConnected, activeTab, isCalibrationModeActive, readRegister]);

//   const loadCalibrationScreenData = useCallback(async () => {
//     if (!isConnected) {
//       toast({ title: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }
    
//     setIsLoading(true);
//     toast({ title: "Atualizando leituras de calibração..." });
    
//     try {
//       const reg8 = await readRegister(8);
//       const reg9 = await readRegister(9);
//       const reg17 = await readRegister(17);
//       const reg20 = await readRegister(20);
//       const reg21 = await readRegister(21);

//       const processedData = {
//         bluePreto: reg8,
//         blueBranco: reg9,
//         blue: reg17,
//         brancuraSemCorrecao: reg20 !== null && !isNaN(reg20) ? reg20 / 10.0 : null,
//         brancuraOnline: reg21 !== null && !isNaN(reg21) ? reg21 / 10.0 : null,
//       };

//       setCalibrationScreenData(processedData);

//       toast({ 
//         title: "Leituras Atualizadas!", 
//         description: `Registros lidos: ${[reg8, reg9, reg17, reg20, reg21].filter(v => v !== null).length}/5` 
//       });

//     } catch (error: any) {
//       toast({ 
//         title: "Erro ao Atualizar Leituras", 
//         description: `Falha: ${error.message}`, 
//         variant: "destructive" 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isConnected, readRegister, toast]);

//   useEffect(() => {
//     if (realTimeIntervalRef.current) {
//       clearInterval(realTimeIntervalRef.current);
//       realTimeIntervalRef.current = null;
//       setIsRealTimeActive(false);
//     }

//     if (activeTab === "calibration" && isConnected && isCalibrationModeActive) {
//       setIsRealTimeActive(true);
//       realTimeIntervalRef.current = setInterval(updateBlueAtualRealTime, 1000);
      
//       updateBlueAtualRealTime();
//     }

//     return () => {
//       if (realTimeIntervalRef.current) {
//         clearInterval(realTimeIntervalRef.current);
//       }
//     };
//   }, [activeTab, isConnected, isCalibrationModeActive, updateBlueAtualRealTime]);

//   useEffect(() => {
//     return () => {
//       if (realTimeIntervalRef.current) {
//         clearInterval(realTimeIntervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (params.id) {
//       const device = WhiteKonStorage.getById(params.id as string);
//       if (device) setDevice(device);
//       else router.push("/whitekon/lista");
//     }
//   }, [params.id, router]);

//   useEffect(() => {
//     if (isConnected && !parametersLoaded) {
//       loadParametersFromDevice();
//     }
//     if (!isConnected) {
//       setParametersLoaded(false);
//       setIsManualControlActive(false);
//       setIsCalibrationModeActive(false);
//       setIsRealTimeActive(false);
//     }
//   }, [isConnected, parametersLoaded, loadParametersFromDevice]);

//   const handleCalibrationModeToggle = async (checked: boolean) => {
//     setIsLoading(true);
//     try {
//       const success = await writeRegister(WhitekonRegisters.MODO_OPERACAO, checked ? 1 : 0);
//       if (success) {
//         setIsCalibrationModeActive(checked);
//         toast({ 
//           title: checked ? "Modo Calibração Ativado" : "Modo Calibração Desativado",
//         });
        
//         if (checked) {
//           await new Promise(resolve => setTimeout(resolve, 500));
//           await loadCalibrationScreenData();
//         }
//       } else {
//         toast({ title: "Erro", description: "Não foi possível alterar o modo de operação.", variant: "destructive" });
//       }
//     } catch (error: any) {
//       toast({ title: "Erro", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCalibrateCommand = async (type: 'escuro' | 'claro') => {
//     if (!isConnected) {
//       toast({ title: "Dispositivo não conectado", variant: "destructive" });
//       return;
//     }

//     if (!isCalibrationModeActive) {
//       toast({ 
//         title: "Modo Calibração Inativo", 
//         description: "Ative o Modo Calibração primeiro.", 
//         variant: "destructive" 
//       });
//       return;
//     }

//     setIsLoading(true);
    
//     const command = type === 'escuro' ? CalibrationCommands.CALIBRA_ESCURO : CalibrationCommands.CALIBRA_CLARO;
    
//     try {
//       const currentReg27 = await readRegister(WhitekonRegisters.COMANDOS_CALIBRACAO);
      
//       if (currentReg27 !== 0) {
//         toast({ 
//           title: "Preparando Registro de Comando", 
//           description: `Registro 27 zerado para aceitar novo comando.`
//         });
        
//         const resetSuccess = await writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, 0);
        
//         if (!resetSuccess) {
//           throw new Error("Falha ao zerar o registro 27");
//         }
        
//         await new Promise(resolve => setTimeout(resolve, 500));
        
//         const verifyReg27 = await readRegister(WhitekonRegisters.COMANDOS_CALIBRACAO);
//         if (verifyReg27 !== 0) {
//           throw new Error(`Registro 27 não foi zerado corretamente.`);
//         }
//       }

//       toast({ 
//         title: `Enviando Comando de Calibração ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
//       });

//       const success = await writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, command);
      
//       if (!success) {
//         throw new Error("Falha ao enviar comando de calibração");
//       }

//       toast({ 
//         title: `Comando Enviado`, 
//       });

//       await new Promise(resolve => setTimeout(resolve, 3000));
      
//       await loadCalibrationScreenData();
      
//       toast({ 
//         title: `Calibração ${type.charAt(0).toUpperCase() + type.slice(1)} Finalizada`, 
//       });

//     } catch (error: any) {
//       toast({ 
//         title: "Erro na Calibração", 
//         description: error.message, 
//         variant: "destructive" 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDebugCommand = async (command: "led" | "bobina", value: boolean) => {
//     if (!isConnected || !isManualControlActive) {
//       toast({ 
//         title: "Controle Manual Inativo", 
//         description: "Habilite o Controle Manual.", 
//         variant: "destructive" 
//       });
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const currentValue = await readRegister(WhitekonRegisters.CONTROLE_REMOTO);
//       if (currentValue === null) {
//         throw new Error("Não foi possível ler o estado do controle");
//       }
      
//       let newValue = currentValue;
//       if (command === "led") {
//         newValue = value ? (currentValue | 1) : (currentValue & ~1);
//       } else if (command === "bobina") {
//         newValue = value ? (currentValue | 2) : (currentValue & ~2);
//       }
      
//       const success = await writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue);
//       if (success) {
//         await new Promise(resolve => setTimeout(resolve, 500));
//         const verifyValue = await readRegister(WhitekonRegisters.CONTROLE_REMOTO);
        
//         if (command === "led") {
//           const ledState = verifyValue !== null && (verifyValue & 1) === 1;
//           setLedStatus(ledState);
//           toast({ 
//             title: `LED ${value ? 'Ligado' : 'Desligado'}`, 
//             description: `Estado atual: ${ledState ? 'Ligado' : 'Desligado'}` 
//           });
//         }
//         if (command === "bobina") {
//           const bobinState = verifyValue !== null && (verifyValue & 2) === 2;
//           setBobinStatus(bobinState);
//           toast({ 
//             title: `Bobina ${value ? 'Acionada' : 'Desligada'}`, 
//             description: `Estado atual: ${bobinState ? 'Acionada' : 'Desligada'}` 
//           });
//         }
//       } else {
//         throw new Error("Dispositivo não aceitou o comando");
//       }
//     } catch (error: any) {
//       toast({ 
//         title: "Erro no Comando", 
//         description: error.message, 
//         variant: "destructive" 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleManualControlToggle = async (checked: boolean) => {
//     setIsLoading(true);
//     const success = await writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, checked ? 1 : 0);
//     if (success) {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       await loadParametersFromDevice();
//     } else {
//       toast({ title: "Erro", description: "O dispositivo não aceitou o comando.", variant: "destructive" });
//       await loadParametersFromDevice();
//     }
//     setIsLoading(false);
//   };

//   const handleEditInputChange = (field: keyof WhiteKonData, value: string) => {
//     setEditValues(prev => ({ ...prev, [field]: value }));
//   };

//   const handleTabChange = (value: string) => {
//     setActiveTab(value);
//   };

//   if (!device) {
//     return <div className="container mx-auto p-4 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center gap-4 mb-6">
//         <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold">{device.name}</h1>
//           <p className="text-gray-600">RTU: {device.rtuAddress} | {device.machineName}</p>
//         </div>
//         <div className="flex items-center gap-2">
//           {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
//           <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Conectado" : "Desconectado"}</Badge>
//         </div>
//       </div>

//       <Tabs defaultValue="calibration" className="space-y-6" onValueChange={handleTabChange}>
//         <TabsList className="grid w-full grid-cols-6">
//           <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
//           <TabsTrigger value="connection">Conexão</TabsTrigger>
//           <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
//           <TabsTrigger value="calibration">Calibração</TabsTrigger>
//           <TabsTrigger value="debug">Debug</TabsTrigger>
//           <TabsTrigger value="registers">Registradores</TabsTrigger>
//         </TabsList>
       
//         <TabsContent value="dashboard"><DashboardTab activeWhitekon={device.rtuAddress} onWhitekonChangeAction={() => {}} /></TabsContent>
//         <TabsContent value="connection"><ConnectionTab /></TabsContent>

//         <TabsContent value="parameters" className="space-y-6">
//             <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <div>
//                         <CardTitle>Parâmetros de Operação</CardTitle>
//                         <p className="text-sm text-muted-foreground">Configurações de leitura e correção do dispositivo.</p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button onClick={loadParametersFromDevice} variant="outline" size="sm" disabled={!isConnected || isLoading}>
//                             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//                             Carregar
//                         </Button>
//                         {isEditingParams ? (
//                             <>
//                                 <Button onClick={() => setIsEditingParams(false)} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancelar</Button>
//                                 <Button onClick={handleSaveParameters} size="sm" disabled={isLoading}><Save className="h-4 w-4 mr-2" />Salvar</Button>
//                             </>
//                         ) : (
//                             <Button onClick={() => setIsEditingParams(true)} size="sm" disabled={!isConnected}><Edit className="h-4 w-4 mr-2" />Editar</Button>
//                         )}
//                     </div>
//                 </CardHeader>
//                 <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//                     <div className="space-y-4">
//                         <h3 className="font-medium">Tempos</h3>
//                         <div className="grid gap-3">
//                             <div className="flex items-center justify-between"><Label>Tempo LED Ligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedLigado ?? ''} onChange={(e) => handleEditInputChange('tempoLedLigado', e.target.value)} /> : <span className="font-mono">{data?.tempoLedLigado ?? '---'}</span>}</div>
//                             <div className="flex items-center justify-between"><Label>Tempo LED Desligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedDesligado ?? ''} onChange={(e) => handleEditInputChange('tempoLedDesligado', e.target.value)} /> : <span className="font-mono">{data?.tempoLedDesligado ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4">
//                         <h3 className="font-medium">Configurações de Leitura</h3>
//                         <div className="grid gap-3">
//                             <div className="flex items-center justify-between"><Label>Tempo Integração:</Label>{isEditingParams ? <Select value={String(editValues.tempoIntegracao ?? '')} onValueChange={(v) => handleEditInputChange('tempoIntegracao', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{INTEGRATION_TIME_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{INTEGRATION_TIME_CODES.find(c => c.code === data?.tempoIntegracao)?.value ?? '---'}</span>}</div>
//                             <div className="flex items-center justify-between"><Label>Ganho:</Label>{isEditingParams ? <Select value={String(editValues.ganho ?? '')} onValueChange={(v) => handleEditInputChange('ganho', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{GAIN_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{GAIN_CODES.find(c => c.code === data?.ganho)?.value ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4">
//                         <h3 className="font-medium">Limites de Brancura</h3>
//                         <div className="grid gap-3">
//                             <div className="flex items-center justify-between"><Label>Brancura Mínima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMinima ?? ''} onChange={(e) => handleEditInputChange('brancuraMinima', e.target.value)} /> : <span className="font-mono">{data?.brancuraMinima?.toFixed(1) ?? '---'}</span>}</div>
//                             <div className="flex items-center justify-between"><Label>Brancura Máxima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMaxima ?? ''} onChange={(e) => handleEditInputChange('brancuraMaxima', e.target.value)} /> : <span className="font-mono">{data?.brancuraMaxima?.toFixed(1) ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4 md:col-span-2 lg:col-span-1">
//                         <h3 className="font-medium">Correções</h3>
//                         <div className="grid gap-3">
//                            <div className="flex items-center justify-between"><Label>Offset:</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.offset ?? ''} onChange={(e) => handleEditInputChange('offset', e.target.value)} /> : <span className="font-mono">{data?.offset?.toFixed(1) ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                     <div className="space-y-4 md:col-span-2">
//                         <h3 className="font-medium">Coeficientes de Correção de Brancura</h3>
//                         <div className="grid gap-x-6 gap-y-3 md:grid-cols-3">
//                            <div className="flex items-center justify-between"><Label>BRA.X²:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoA ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoA', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoA ?? '---'}</span>}</div>
//                            <div className="flex items-center justify-between"><Label>BRA.X:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoB ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoB', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoB ?? '---'}</span>}</div>
//                            <div className="flex items-center justify-between"><Label>BRA.C:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoC ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoC', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoC ?? '---'}</span>}</div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </TabsContent>

//         <TabsContent value="calibration" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Calibração do Sensor de Brancura</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="flex items-center justify-between p-4 border rounded-lg">
//                 <div>
//                   <Label htmlFor="calibration-mode-switch" className="text-base font-medium">
//                     Modo Calibração
//                   </Label>
//                   <p className="text-sm text-muted-foreground">
//                     Ativa o modo de calibração para o dispositivo.
//                   </p>
//                 </div>
//                 <Switch
//                   id="calibration-mode-switch"
//                   checked={isCalibrationModeActive}
//                   onCheckedChange={handleCalibrationModeToggle}
//                   disabled={!isConnected || isLoading}
//                 />
//               </div>

//               {isCalibrationModeActive && (
//                 <div className="space-y-6 p-4 border rounded-lg bg-blue-50 animate-in fade-in-50">
//                   <div className="grid gap-6 md:grid-cols-2">
//                     <Card className="p-4">
//                       <div className="flex items-center justify-between mb-4">
//                         <h5 className="font-medium text-blue-800">Leituras de Calibração</h5>
//                         <Button 
//                           onClick={loadCalibrationScreenData} 
//                           variant="outline" 
//                           size="sm" 
//                           disabled={isLoading}
//                         >
//                           <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//                           Atualizar Leituras
//                         </Button>
//                       </div>
//                       <div className="grid gap-3 text-sm">
//                         <div className="flex justify-between items-center">
//                           <Label>Blue Preto:</Label>
//                           <span className={`font-mono px-2 py-1 rounded ${
//                             calibrationScreenData.bluePreto !== null ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
//                           }`}>
//                             {calibrationScreenData.bluePreto ?? '---'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center">
//                           <Label>Blue Branco:</Label>
//                           <span className={`font-mono px-2 py-1 rounded ${
//                             calibrationScreenData.blueBranco !== null ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
//                           }`}>
//                             {calibrationScreenData.blueBranco ?? '---'}
//                           </span>
//                         </div>
                        
//                         <hr className="my-2" />
                        
//                         <div className="flex justify-between items-center">
//                           <Label>Brancura s/ Correção:</Label>
//                           <span className="font-mono px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                             {calibrationScreenData.brancuraSemCorrecao?.toFixed(1) ?? '---'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center">
//                           <Label>Brancura Online:</Label>
//                           <span className="font-mono px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                             {calibrationScreenData.brancuraOnline?.toFixed(1) ?? '---'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center font-bold">
//                           <Label>Blue Atual:</Label>
//                           <div className="flex items-center gap-2">
//                             <span className="font-mono px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
//                               {calibrationScreenData.blue ?? '---'}
//                             </span>
//                             {isRealTimeActive && (
//                               <div className="flex items-center gap-1">
//                                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                                 <span className="text-xs text-green-600 font-semibold">TEMPO REAL</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-xs">
//                         <div className="flex items-center justify-between">
//                           <span className="text-green-700">Status Tempo Real:</span>
//                           <span className={`font-semibold ${isRealTimeActive ? 'text-green-600' : 'text-gray-500'}`}>
//                             {isRealTimeActive ? '✓ ATIVO (1s)' : '⏸ INATIVO'}
//                           </span>
//                         </div>
//                       </div>
//                     </Card>

//                     <Card className="p-4">
//                       <h5 className="font-medium text-blue-800 mb-4">Comandos de Calibração</h5>
//                       <div className="space-y-3">
//                         <Button 
//                           onClick={() => handleCalibrateCommand('escuro')} 
//                           disabled={isLoading} 
//                           className="w-full bg-gray-700 hover:bg-gray-800"
//                         >
//                           {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
//                           Calibrar Bolacha Escura
//                         </Button>
                        
//                         <Button 
//                           onClick={() => handleCalibrateCommand('claro')} 
//                           disabled={isLoading} 
//                           className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
//                         >
//                           {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
//                           Calibrar Bolacha Clara
//                         </Button>
//                       </div>
//                     </Card>
//                   </div>
                  
//                   <CalibrationAlarms />

//                   <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <h6 className="font-medium text-yellow-800 mb-2">Instruções de Calibração das Bolachas:</h6>
//                     <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
//                       <li><strong>Clicar no botão "Atualizar Leituras" para verificar os valores atuais</strong></li>
//                       <li><strong>Posicionar a Bolacha padrão escuro na frente do sensor e clicar "Calibrar Escuro"</strong></li>
//                       <li><strong>Esperar a mensagem de confirmação, "Calibração Escuro Finalizada" </strong></li>
//                       <li><strong>Posicionar a Bolacha padrão claro na frente do sensor e clicar "Calibrar Claro"</strong></li>
//                       <li><strong>Esperar a mensagem de confirmação, "Calibração Claro Finalizada" </strong></li>
//                     </ul>
//                   </div>

//                   <div className="flex items-center justify-center space-x-4 p-3 bg-blue-100 rounded-lg">
//                     <div className="flex items-center space-x-2">
//                       <div className={`w-3 h-3 rounded-full ${
//                         calibrationScreenData.bluePreto !== null && calibrationScreenData.bluePreto > 0 ? 'bg-green-500' : 'bg-gray-300'
//                       }`} />
//                       <span className="text-sm font-medium">Escuro Calibrado</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <div className={`w-3 h-3 rounded-full ${
//                         calibrationScreenData.blueBranco !== null && calibrationScreenData.blueBranco > 0 ? 'bg-green-500' : 'bg-gray-300'
//                       }`} />
//                       <span className="text-sm font-medium">Claro Calibrado</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="debug" className="space-y-6">
//           <Card>
//             <CardHeader><CardTitle>Debug e Controle Manual</CardTitle></CardHeader>
//             <CardContent className="space-y-6">
//               <div className="flex items-center justify-between p-4 border rounded-lg">
//                 <div>
//                   <Label htmlFor="manual-control-switch" className="text-base font-medium">Habilitar Controle Manual</Label>
//                 </div>
//                 <Switch
//                   id="manual-control-switch"
//                   checked={isManualControlActive}
//                   onCheckedChange={handleManualControlToggle}
//                   disabled={!isConnected || isLoading}
//                 />
//               </div>

//               {isManualControlActive && (
//                 <div className="space-y-4 p-4 border rounded-lg bg-gray-50 animate-in fade-in-50">
//                   <div className="mb-4">
//                     <h4 className="font-medium text-blue-800">Controles Ativos</h4>
//                   </div>
//                   <div className="grid gap-6 md:grid-cols-2">
//                     <div className="space-y-2">
//                       <Label>Controle LED</Label>
//                       <div className="flex gap-2">
//                         <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDebugCommand("led", true)} disabled={isLoading}>Ligar LED</Button>
//                         <Button size="sm" variant="destructive" onClick={() => handleDebugCommand("led", false)} disabled={isLoading}>Desligar LED</Button>
//                       </div>
//                        <p className="text-xs text-gray-500">Status: {ledStatus ? "Ligado" : "Desligado"}</p>
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Controle Bobina</Label>
//                       <div className="flex gap-2">
//                         <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDebugCommand("bobina", true)} disabled={isLoading}>Acionar Bobina</Button>
//                         <Button size="sm" variant="destructive" onClick={() => handleDebugCommand("bobina", false)} disabled={isLoading}>Desligar Bobina</Button>
//                       </div>
//                        <p className="text-xs text-gray-500">Status: {bobinStatus ? "Acionada" : "Desligada"}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="registers"><RegistersTabReal deviceId={device.id} /></TabsContent>
//       </Tabs>
//     </div>
//   );
// }







// // o mais correto, atualizado, testado e funcionando

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
  const { isConnected, readRegister, writeRegister, readAllRegisters, whitekonData } = useWhitekon()

  const [device, setDevice] = useState<WhiteKon | null>(null)
  const [data, setData] = useState<WhiteKonData | null>(null)

  const [isEditingParams, setIsEditingParams] = useState(false)
  const [editValues, setEditValues] = useState<Partial<WhiteKonData>>({})

  const [isManualControlActive, setIsManualControlActive] = useState(false)
  const [ledStatus, setLedStatus] = useState(false)
  const [bobinStatus, setBobinStatus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [parametersLoaded, setParametersLoaded] = useState(false)

  // Estados para calibração
  const [isCalibrationModeActive, setIsCalibrationModeActive] = useState(false)
  const [calibrationScreenData, setCalibrationScreenData] = useState({
    bluePreto: null as number | null,
    blueBranco: null as number | null,
    brancuraSemCorrecao: null as number | null,
    brancuraOnline: null as number | null,
    blue: null as number | null,
  })

  // --- NOVOS ESTADOS PARA ATUALIZAÇÃO EM TEMPO REAL ---
  const [activeTab, setActiveTab] = useState("calibration")
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [realTimeAlarmValue, setRealTimeAlarmValue] = useState<number | null>(null);

  // --- NOVA FUNÇÃO PARA ATUALIZAR ALARMES EM TEMPO REAL ---
  const updateAlarmsRealTime = useCallback(async () => {
    if (!isConnected || activeTab !== "calibration" || !isCalibrationModeActive) {
      return;
    }
    try {
      const alarmValue = await readRegister(WhitekonRegisters.ALARMES);
      setRealTimeAlarmValue(alarmValue);
    } catch (error) {
      // Silenciar erros de tempo real para não poluir a interface
      console.error("Erro na atualização em tempo real dos Alarmes:", error);
    }
  }, [isConnected, activeTab, isCalibrationModeActive, readRegister]);

  const updateBlueAtualRealTime = useCallback(async () => {
    if (!isConnected || activeTab !== "calibration" || !isCalibrationModeActive) {
      return;
    }
    try {
      const blueValue = await readRegister(WhitekonRegisters.BLUE);
      setCalibrationScreenData(prev => ({
        ...prev,
        blue: blueValue
      }));
    } catch (error) {
      console.error("Erro na atualização em tempo real do Blue Atual:", error);
    }
  }, [isConnected, activeTab, isCalibrationModeActive, readRegister]);

  // --- USEEFFECT ATUALIZADO PARA INCLUIR POLLING DOS ALARMES ---
  useEffect(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current);
      realTimeIntervalRef.current = null;
    }

    if (activeTab === "calibration" && isConnected && isCalibrationModeActive) {
      const intervalId = setInterval(() => {
        updateBlueAtualRealTime();
        updateAlarmsRealTime(); // Adicionada a chamada para atualizar alarmes
      }, 500); // Intervalo de 1 segundo
      realTimeIntervalRef.current = intervalId;

      // Leituras iniciais
      updateBlueAtualRealTime();
      updateAlarmsRealTime();
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [activeTab, isConnected, isCalibrationModeActive, updateBlueAtualRealTime, updateAlarmsRealTime]);

  const loadParametersFromDevice = useCallback(async () => {
    if (!isConnected) {
      toast({ title: "Dispositivo não conectado", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    toast({ title: "Lendo parâmetros da placa..." });
    try {
      const registers = await readAllRegisters();

      const loadedData: WhiteKonData = {
        tempoLedLigado: registers[49],
        tempoLedDesligado: registers[48],
        tempoIntegracao: registers[34] !== null ? (registers[34] >> 8) & 0xff : null,
        ganho: registers[34] !== null ? registers[34] & 0xff : null,
        brancuraMinima: registers[53] !== null ? registers[53] / 10.0 : null,
        brancuraMaxima: registers[54] !== null ? registers[54] / 10.0 : null,
        offset: registers[52] !== null ? registers[52] / 10.0 : null,
        coefACorrecaoA: registers[42],
        coefACorrecaoB: registers[44],
        coefACorrecaoC: registers[46],
        modoOperacao: registers[0],
        automaticoManual: registers[29],
        controleRemoto: registers[28],
        brancuraMedia: null, brancuraOnline: null, brancuraSemCorrecao: null, desvPadrao: null, tempCalibracao: null, tempOnline: null, red: null, green: null, blue: null, clear: null, bluePreto: null, blueBranco: null, contadorAmostras: null, alarmes: null, valorEscuroPadrao: null, valorClaroPadrao: null, escuroMaximo: null, claroMinimo: null, coefATempA: null, coefATempB: null, coefATempC: null,
      };

      setData(loadedData);
      setEditValues(loadedData);
      setParametersLoaded(true);
      
      setIsManualControlActive(registers[29] === 1);
      setLedStatus(registers[28] !== null && (registers[28] & 1) === 1);
      setBobinStatus(registers[28] !== null && (registers[28] & 2) === 2);
      
      setIsCalibrationModeActive(registers[0] === 1);
      
      toast({ title: "Parâmetros sincronizados com o dispositivo!" });
    } catch (error: any) {
      toast({ title: "Erro ao Sincronizar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, readAllRegisters, toast]);

  const handleSaveParameters = async () => {
    setIsLoading(true);
    toast({ title: "Salvando parâmetros no dispositivo..." });
    try {
        const updates: { register: number; value: number }[] = [];

        if (editValues.tempoLedLigado !== null) updates.push({ register: 49, value: Number(editValues.tempoLedLigado) });
        if (editValues.tempoLedDesligado !== null) updates.push({ register: 48, value: Number(editValues.tempoLedDesligado) });
        if (editValues.brancuraMinima !== null) updates.push({ register: 53, value: Math.round(Number(editValues.brancuraMinima) * 10) });
        if (editValues.brancuraMaxima !== null) updates.push({ register: 54, value: Math.round(Number(editValues.brancuraMaxima) * 10) });
        if (editValues.offset !== null) updates.push({ register: 52, value: Math.round(Number(editValues.offset) * 10) });
        if (editValues.coefACorrecaoA !== null) updates.push({ register: 42, value: Number(editValues.coefACorrecaoA) });
        if (editValues.coefACorrecaoB !== null) updates.push({ register: 44, value: Number(editValues.coefACorrecaoB) });
        if (editValues.coefACorrecaoC !== null) updates.push({ register: 46, value: Number(editValues.coefACorrecaoC) });
        
        const tempo = editValues.tempoIntegracao ?? data?.tempoIntegracao ?? 0;
        const ganho = editValues.ganho ?? data?.ganho ?? 0;
        updates.push({ register: 34, value: (tempo << 8) | ganho });

        let successCount = 0;
        for (const update of updates) {
            if (await writeRegister(update.register, update.value)) {
                successCount++;
            }
        }

        if (successCount === updates.length) {
            toast({ title: "Sucesso!", description: "Todos os parâmetros foram salvos." });
        } else {
            toast({ title: "Atenção", description: `${successCount} de ${updates.length} parâmetros foram salvos.`, variant: "destructive" });
        }

        setIsEditingParams(false);
        await loadParametersFromDevice(); 

    } catch (error: any) {
        toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const loadCalibrationScreenData = useCallback(async () => {
    if (!isConnected) {
      toast({ title: "Dispositivo não conectado", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    toast({ title: "Atualizando leituras de calibração..." });
    
    try {
      const reg8 = await readRegister(8);
      const reg9 = await readRegister(9);
      const reg17 = await readRegister(17);
      const reg20 = await readRegister(20);
      const reg21 = await readRegister(21);
      const reg10 = await readRegister(10); // Ler registro de alarme

      const processedData = {
        bluePreto: reg8,
        blueBranco: reg9,
        blue: reg17,
        brancuraSemCorrecao: reg20 !== null && !isNaN(reg20) ? reg20 / 10.0 : null,
        brancuraOnline: reg21 !== null && !isNaN(reg21) ? reg21 / 10.0 : null,
      };

      setCalibrationScreenData(processedData);
      setRealTimeAlarmValue(reg10); // Atualiza o estado do alarme

      toast({ 
        title: "Leituras Atualizadas!", 
        description: "Dados de calibração e alarmes sincronizados." 
      });

    } catch (error: any) {
      toast({ 
        title: "Erro ao Atualizar Leituras", 
        description: `Falha: ${error.message}`, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, readRegister, toast]);

  useEffect(() => {
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (params.id) {
      const device = WhiteKonStorage.getById(params.id as string);
      if (device) setDevice(device);
      else router.push("/whitekon/lista");
    }
  }, [params.id, router]);

  useEffect(() => {
    if (isConnected && !parametersLoaded) {
      loadParametersFromDevice();
    }
    if (!isConnected) {
      setParametersLoaded(false);
      setIsManualControlActive(false);
      setIsCalibrationModeActive(false);
    }
  }, [isConnected, parametersLoaded, loadParametersFromDevice]);

  const handleCalibrationModeToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const success = await writeRegister(WhitekonRegisters.MODO_OPERACAO, checked ? 1 : 0);
      if (success) {
        setIsCalibrationModeActive(checked);
        toast({ 
          title: checked ? "Modo Calibração Ativado" : "Modo Calibração Desativado",
        });
        
        if (checked) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await loadCalibrationScreenData();
        } else {
          // Limpa o valor do alarme em tempo real ao sair do modo
          setRealTimeAlarmValue(null);
        }
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
    if (!isConnected) {
      toast({ title: "Dispositivo não conectado", variant: "destructive" });
      return;
    }

    if (!isCalibrationModeActive) {
      toast({ 
        title: "Modo Calibração Inativo", 
        description: "Ative o Modo Calibração primeiro.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    
    const command = type === 'escuro' ? CalibrationCommands.CALIBRA_ESCURO : CalibrationCommands.CALIBRA_CLARO;
    
    try {
      const currentReg27 = await readRegister(WhitekonRegisters.COMANDOS_CALIBRACAO);
      
      if (currentReg27 !== 0) {
        toast({ 
          title: "Preparando Registro de Comando", 
          description: `Registro 27 zerado para aceitar novo comando.`
        });
        
        const resetSuccess = await writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, 0);
        
        if (!resetSuccess) {
          throw new Error("Falha ao zerar o registro 27");
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const verifyReg27 = await readRegister(WhitekonRegisters.COMANDOS_CALIBRACAO);
        if (verifyReg27 !== 0) {
          throw new Error(`Registro 27 não foi zerado corretamente.`);
        }
      }

      toast({ 
        title: `Enviando Comando de Calibração ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
      });

      const success = await writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, command);
      
      if (!success) {
        throw new Error("Falha ao enviar comando de calibração");
      }

      toast({ 
        title: `Comando Enviado`, 
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await loadCalibrationScreenData();
      
      toast({ 
        title: `Calibração ${type.charAt(0).toUpperCase() + type.slice(1)} Finalizada`, 
      });

    } catch (error: any) {
      toast({ 
        title: "Erro na Calibração", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDebugCommand = async (command: "led" | "bobina", value: boolean) => {
    if (!isConnected || !isManualControlActive) {
      toast({ 
        title: "Controle Manual Inativo", 
        description: "Habilite o Controle Manual.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const currentValue = await readRegister(WhitekonRegisters.CONTROLE_REMOTO);
      if (currentValue === null) {
        throw new Error("Não foi possível ler o estado do controle");
      }
      
      let newValue = currentValue;
      if (command === "led") {
        newValue = value ? (currentValue | 1) : (currentValue & ~1);
      } else if (command === "bobina") {
        newValue = value ? (currentValue | 2) : (currentValue & ~2);
      }
      
      const success = await writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue);
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const verifyValue = await readRegister(WhitekonRegisters.CONTROLE_REMOTO);
        
        if (command === "led") {
          const ledState = verifyValue !== null && (verifyValue & 1) === 1;
          setLedStatus(ledState);
          toast({ 
            title: `LED ${value ? 'Ligado' : 'Desligado'}`, 
            description: `Estado atual: ${ledState ? 'Ligado' : 'Desligado'}` 
          });
        }
        if (command === "bobina") {
          const bobinState = verifyValue !== null && (verifyValue & 2) === 2;
          setBobinStatus(bobinState);
          toast({ 
            title: `Bobina ${value ? 'Acionada' : 'Desligada'}`, 
            description: `Estado atual: ${bobinState ? 'Acionada' : 'Desligada'}` 
          });
        }
      } else {
        throw new Error("Dispositivo não aceitou o comando");
      }
    } catch (error: any) {
      toast({ 
        title: "Erro no Comando", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualControlToggle = async (checked: boolean) => {
    setIsLoading(true);
    const success = await writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, checked ? 1 : 0);
    if (success) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadParametersFromDevice();
    } else {
      toast({ title: "Erro", description: "O dispositivo não aceitou o comando.", variant: "destructive" });
      await loadParametersFromDevice();
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

      <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
          <TabsTrigger value="calibration">Calibração</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="registers">Registradores</TabsTrigger>
        </TabsList>
       
        <TabsContent value="dashboard"><DashboardTab activeWhitekon={device.rtuAddress} onWhitekonChangeAction={() => {}} /></TabsContent>
        <TabsContent value="connection"><ConnectionTab /></TabsContent>

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
                            <div className="flex items-center justify-between"><Label>Tempo LED Ligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedLigado ?? ''} onChange={(e) => handleEditInputChange('tempoLedLigado', e.target.value)} /> : <span className="font-mono">{data?.tempoLedLigado ?? '---'}</span>}</div>
                            <div className="flex items-center justify-between"><Label>Tempo LED Desligado (ms):</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.tempoLedDesligado ?? ''} onChange={(e) => handleEditInputChange('tempoLedDesligado', e.target.value)} /> : <span className="font-mono">{data?.tempoLedDesligado ?? '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-medium">Configurações de Leitura</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between"><Label>Tempo Integração:</Label>{isEditingParams ? <Select value={String(editValues.tempoIntegracao ?? '')} onValueChange={(v) => handleEditInputChange('tempoIntegracao', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{INTEGRATION_TIME_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{INTEGRATION_TIME_CODES.find(c => c.code === data?.tempoIntegracao)?.value ?? '---'}</span>}</div>
                            <div className="flex items-center justify-between"><Label>Ganho:</Label>{isEditingParams ? <Select value={String(editValues.ganho ?? '')} onValueChange={(v) => handleEditInputChange('ganho', v)}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{GAIN_CODES.map(c => <SelectItem key={c.code} value={String(c.code)}>{c.value}</SelectItem>)}</SelectContent></Select> : <span className="font-mono">{GAIN_CODES.find(c => c.code === data?.ganho)?.value ?? '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-medium">Limites de Brancura</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between"><Label>Brancura Mínima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMinima ?? ''} onChange={(e) => handleEditInputChange('brancuraMinima', e.target.value)} /> : <span className="font-mono">{data?.brancuraMinima?.toFixed(1) ?? '---'}</span>}</div>
                            <div className="flex items-center justify-between"><Label>Brancura Máxima (%):</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.brancuraMaxima ?? ''} onChange={(e) => handleEditInputChange('brancuraMaxima', e.target.value)} /> : <span className="font-mono">{data?.brancuraMaxima?.toFixed(1) ?? '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4 md:col-span-2 lg:col-span-1">
                        <h3 className="font-medium">Correções</h3>
                        <div className="grid gap-3">
                           <div className="flex items-center justify-between"><Label>Offset:</Label>{isEditingParams ? <Input type="number" step="0.1" className="w-28" value={editValues.offset ?? ''} onChange={(e) => handleEditInputChange('offset', e.target.value)} /> : <span className="font-mono">{data?.offset?.toFixed(1) ?? '---'}</span>}</div>
                        </div>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <h3 className="font-medium">Coeficientes de Correção de Brancura</h3>
                        <div className="grid gap-x-6 gap-y-3 md:grid-cols-3">
                           <div className="flex items-center justify-between"><Label>BRA.X²:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoA ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoA', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoA ?? '---'}</span>}</div>
                           <div className="flex items-center justify-between"><Label>BRA.X:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoB ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoB', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoB ?? '---'}</span>}</div>
                           <div className="flex items-center justify-between"><Label>BRA.C:</Label>{isEditingParams ? <Input type="number" className="w-28" value={editValues.coefACorrecaoC ?? ''} onChange={(e) => handleEditInputChange('coefACorrecaoC', e.target.value)} /> : <span className="font-mono">{data?.coefACorrecaoC ?? '---'}</span>}</div>
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
                    {/* SEÇÃO RESTAURADA */}
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
                      alarmRegisterValue={realTimeAlarmValue ?? whitekonData?.registers?.[WhitekonRegisters.ALARMES] ?? 0}
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
                      <div className={`w-3 h-3 rounded-full ${calibrationScreenData.bluePreto !== null && calibrationScreenData.bluePreto > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium">Escuro Calibrado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${calibrationScreenData.blueBranco !== null && calibrationScreenData.blueBranco > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
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

        <TabsContent value="registers"><RegistersTabReal deviceId={device.id} /></TabsContent>
      </Tabs>
    </div>
  );
}














