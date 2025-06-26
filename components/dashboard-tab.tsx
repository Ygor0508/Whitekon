// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon } from "lucide-react"
// import { WhitekonMonitor } from "@/components/whitekon-monitor"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { useToast } from "@/hooks/use-toast"

// interface DashboardTabProps {
//   activeWhitekon: number
//   onWhitekonChangeAction: (id: number) => void
// }

// export function DashboardTab({ activeWhitekon, onWhitekonChangeAction }: DashboardTabProps) {
//   const [silenceAlarms, setSilenceAlarms] = useState(false)
//   const [emergencyMode, setEmergencyMode] = useState(false)
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [whitekonUnits, setWhitekonUnits] = useState<any[]>([])
//   const [alarms, setAlarms] = useState<any[]>([])

//   const { toast } = useToast()
//   const { isConnected, whitekonData } = useWhitekon()

//   // Atualiza o relógio a cada segundo
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date())
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [])

//   // Inscreve-se para receber atualizações de dados
//   useEffect(() => {
//     // Se temos dados, atualizamos a unidade ativa
//     if (whitekonData?.registers) {
//       setWhitekonUnits((prev) => {
//         const newUnits = [...prev]
//         const unitIndex = newUnits.findIndex((u) => u.id === activeWhitekon)

//         if (unitIndex >= 0) {
//           newUnits[unitIndex] = {
//             ...newUnits[unitIndex],
//             status: "online",
//             brancura: whitekonData.registers[5] ? whitekonData.registers[5] / 10 : 0, // BRANCURA_MEDIA
//             calibrado: true,
//           }
//         } else {
//           newUnits.push({
//             id: activeWhitekon,
//             status: "online",
//             brancura: whitekonData.registers[5] ? whitekonData.registers[5] / 10 : 0,
//             calibrado: true,
//           })
//         }

//         return newUnits
//       })

//       // Verifica alarmes usando o registro 10
//       if (whitekonData.registers[10]) {
//         processAlarms(whitekonData.registers[10])
//       }
//     }
//   }, [whitekonData, activeWhitekon])

//   // Função para processar os bits de alarme
//   const processAlarms = (alarmBits: number) => {
//     const newAlarms = []

//     // Verifica cada bit de alarme conforme a tabela fornecida
//     if (alarmBits & (1 << 0))
//       newAlarms.push({
//         id: Date.now() + 1,
//         type: "Escuro > Claro",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 1))
//       newAlarms.push({
//         id: Date.now() + 2,
//         type: "Escuro = Claro",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 2))
//       newAlarms.push({
//         id: Date.now() + 3,
//         type: "Saiu sem calibrar",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 3))
//       newAlarms.push({
//         id: Date.now() + 4,
//         type: "Escuro > 3000",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 4))
//       newAlarms.push({
//         id: Date.now() + 5,
//         type: "Claro < 4000",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 8))
//       newAlarms.push({
//         id: Date.now() + 6,
//         type: "Brancura Muito Alta",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 9))
//       newAlarms.push({
//         id: Date.now() + 7,
//         type: "Brancura Muito Baixa",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 10))
//       newAlarms.push({
//         id: Date.now() + 8,
//         type: "Sem Leitura do Sensor",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 11))
//       newAlarms.push({
//         id: Date.now() + 9,
//         type: "Erro na Temperatura",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 12))
//       newAlarms.push({
//         id: Date.now() + 10,
//         type: "Sensor Desconectado",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })

//     setAlarms(newAlarms)
//   }

//   const handleEmergencyToggle = () => {
//     const newState = !emergencyMode
//     setEmergencyMode(newState)

//     if (newState) {
//       toast({
//         title: "Modo de emergência ativado",
//         description: "Todas as operações críticas foram interrompidas",
//         variant: "destructive",
//       })
//     } else {
//       toast({
//         title: "Modo de emergência desativado",
//         description: "Operações normais restauradas",
//       })
//     }
//   }

//   const handleSilenceAlarmsToggle = () => {
//     const newState = !silenceAlarms
//     setSilenceAlarms(newState)

//     if (newState) {
//       toast({
//         title: "Alarmes silenciados",
//         description: "Notificações sonoras desativadas",
//       })
//     } else {
//       toast({
//         title: "Alarmes ativados",
//         description: "Notificações sonoras restauradas",
//       })
//     }
//   }

//   return (
//     <div className="grid gap-6">
//       <div className="flex flex-wrap justify-between items-center gap-4">
//         <div className="flex gap-2">
//           <Button
//             variant={emergencyMode ? "default" : "outline"}
//             className={emergencyMode ? "bg-red-500 hover:bg-red-600" : ""}
//             onClick={handleEmergencyToggle}
//           >
//             <AlertCircle className="mr-2 h-4 w-4" />
//             Emergência
//           </Button>
//           <Button
//             variant={silenceAlarms ? "default" : "outline"}
//             className={silenceAlarms ? "bg-blue-500 hover:bg-blue-600" : ""}
//             onClick={handleSilenceAlarmsToggle}
//           >
//             {silenceAlarms ? (
//               <>
//                 <BellOff className="mr-2 h-4 w-4" />
//                 Silêncio
//               </>
//             ) : (
//               <>
//                 <Bell className="mr-2 h-4 w-4" />
//                 Silenciar
//               </>
//             )}
//           </Button>
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <ThermometerIcon className="h-4 w-4 text-orange-500" />
//             <span>Temp: {whitekonData?.registers[7] ? (whitekonData.registers[7] / 10).toFixed(1) : "N/A"} °C</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock className="h-4 w-4" />
//             <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
//           </div>
//         </div>
//       </div>

//       {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {whitekonUnits.length > 0 ? (
//           whitekonUnits.map((unit) => (
//             <Card
//               key={unit.id}
//               className={`cursor-pointer ${activeWhitekon === unit.id ? "border-[#00A651] border-2" : ""}`}
//               onClick={() => onWhitekonChangeAction(unit.id)}
//             >
//               <CardHeader className="p-4">
//                 <div className="flex justify-between items-center">
//                   <CardTitle className="text-lg">WhiteKon {unit.id}</CardTitle>
//                   <Badge
//                     variant={unit.status === "online" ? "default" : "destructive"}
//                     className={unit.status === "online" ? "bg-[#00A651]" : ""}
//                   >
//                     {unit.status === "online" ? "Online" : "Offline"}
//                   </Badge>
//                 </div>
//               </CardHeader>
//               <CardContent className="p-4 pt-0">
//                 <div className="grid gap-2">
//                   <div className="flex justify-between">
//                     <span className="font-medium">Brancura:</span>
//                     <span className="font-bold">{unit.brancura ? unit.brancura.toFixed(2) : "N/A"}%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="font-medium">Calibrado:</span>
//                     <Badge variant={unit.calibrado ? "outline" : "destructive"}>{unit.calibrado ? "Sim" : "Não"}</Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <div className="col-span-4 flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200">
//             <p className="text-gray-500 mb-2">
//               {isConnected ? "Aguardando dados do WhiteKon..." : "Nenhum dispositivo WhiteKon conectado"}
//             </p>
//             <p className="text-sm text-gray-400">
//               {isConnected ? "Dados serão exibidos em breve" : "Conecte um dispositivo na aba Conexão"}
//             </p>
//           </div>
//         )}
//       </div> */}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Monitor WhiteKon {activeWhitekon}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <WhitekonMonitor whitekonId={activeWhitekon} />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Alarmes Ativos</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {alarms.length > 0 ? (
//               <div className="space-y-4">
//                 {alarms.map((alarm) => (
//                   <div
//                     key={alarm.id}
//                     className="p-3 border rounded-md bg-red-50 border-red-200 flex justify-between items-center"
//                   >
//                     <div>
//                       <p className="font-medium text-red-800">{alarm.type}</p>
//                       <p className="text-sm text-gray-500">WhiteKon {alarm.unit}</p>
//                     </div>
//                     <div className="text-sm text-gray-500">{alarm.time}</div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-6 text-gray-500">Nenhum alarme ativo</div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }







// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon } from "lucide-react"
// import { WhitekonMonitor } from "@/components/whitekon-monitor"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { useToast } from "@/hooks/use-toast"
// import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


// interface DashboardTabProps {
//   activeWhitekon: number
//   onWhitekonChangeAction: (id: number) => void
// }

// export function DashboardTab({ activeWhitekon, onWhitekonChangeAction }: DashboardTabProps) {
//   const [silenceAlarms, setSilenceAlarms] = useState(false)
//   const [emergencyMode, setEmergencyMode] = useState(false)
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [whitekonUnits, setWhitekonUnits] = useState<any[]>([])
//   const [alarms, setAlarms] = useState<any[]>([])

//   const { toast } = useToast()
//   const { isConnected, whitekonData, whitenessHistory } = useWhitekon()

//   // Atualiza o relógio a cada segundo
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date())
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [])

//   // Inscreve-se para receber atualizações de dados
//   useEffect(() => {
//     // Se temos dados, atualizamos a unidade ativa
//     if (whitekonData?.registers) {
//       setWhitekonUnits((prev) => {
//         const newUnits = [...prev]
//         const unitIndex = newUnits.findIndex((u) => u.id === activeWhitekon)

//         if (unitIndex >= 0) {
//           newUnits[unitIndex] = {
//             ...newUnits[unitIndex],
//             status: "online",
//             brancura: whitekonData.registers[5] ? whitekonData.registers[5] / 10 : 0, // BRANCURA_MEDIA
//             calibrado: true,
//           }
//         } else {
//           newUnits.push({
//             id: activeWhitekon,
//             status: "online",
//             brancura: whitekonData.registers[5] ? whitekonData.registers[5] / 10 : 0,
//             calibrado: true,
//           })
//         }

//         return newUnits
//       })

//       // Verifica alarmes usando o registro 10
//       if (whitekonData.registers[10]) {
//         processAlarms(whitekonData.registers[10])
//       }
//     }
//   }, [whitekonData, activeWhitekon])

//   // Função para processar os bits de alarme
//   const processAlarms = (alarmBits: number) => {
//     const newAlarms = []

//     // Verifica cada bit de alarme conforme a tabela fornecida
//     if (alarmBits & (1 << 0))
//       newAlarms.push({
//         id: Date.now() + 1,
//         type: "Escuro > Claro",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 1))
//       newAlarms.push({
//         id: Date.now() + 2,
//         type: "Escuro = Claro",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 2))
//       newAlarms.push({
//         id: Date.now() + 3,
//         type: "Saiu sem calibrar",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 3))
//       newAlarms.push({
//         id: Date.now() + 4,
//         type: "Escuro > 3000",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 4))
//       newAlarms.push({
//         id: Date.now() + 5,
//         type: "Claro < 4000",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 8))
//       newAlarms.push({
//         id: Date.now() + 6,
//         type: "Brancura Muito Alta",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 9))
//       newAlarms.push({
//         id: Date.now() + 7,
//         type: "Brancura Muito Baixa",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 10))
//       newAlarms.push({
//         id: Date.now() + 8,
//         type: "Sem Leitura do Sensor",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 11))
//       newAlarms.push({
//         id: Date.now() + 9,
//         type: "Erro na Temperatura",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })
//     if (alarmBits & (1 << 12))
//       newAlarms.push({
//         id: Date.now() + 10,
//         type: "Sensor Desconectado",
//         unit: activeWhitekon,
//         time: new Date().toLocaleTimeString(),
//       })

//     setAlarms(newAlarms)
//   }

//   const handleEmergencyToggle = () => {
//     const newState = !emergencyMode
//     setEmergencyMode(newState)

//     if (newState) {
//       toast({
//         title: "Modo de emergência ativado",
//         description: "Todas as operações críticas foram interrompidas",
//         variant: "destructive",
//       })
//     } else {
//       toast({
//         title: "Modo de emergência desativado",
//         description: "Operações normais restauradas",
//       })
//     }
//   }

//   const handleSilenceAlarmsToggle = () => {
//     const newState = !silenceAlarms
//     setSilenceAlarms(newState)

//     if (newState) {
//       toast({
//         title: "Alarmes silenciados",
//         description: "Notificações sonoras desativadas",
//       })
//     } else {
//       toast({
//         title: "Alarmes ativados",
//         description: "Notificações sonoras restauradas",
//       })
//     }
//   }

//   return (
//     <div className="grid gap-6">
//       <div className="flex flex-wrap justify-between items-center gap-4">
//         <div className="flex gap-2">
//           <Button
//             variant={emergencyMode ? "default" : "outline"}
//             className={emergencyMode ? "bg-red-500 hover:bg-red-600" : ""}
//             onClick={handleEmergencyToggle}
//           >
//             <AlertCircle className="mr-2 h-4 w-4" />
//             Emergência
//           </Button>
//           <Button
//             variant={silenceAlarms ? "default" : "outline"}
//             className={silenceAlarms ? "bg-blue-500 hover:bg-blue-600" : ""}
//             onClick={handleSilenceAlarmsToggle}
//           >
//             {silenceAlarms ? (
//               <>
//                 <BellOff className="mr-2 h-4 w-4" />
//                 Silêncio
//               </>
//             ) : (
//               <>
//                 <Bell className="mr-2 h-4 w-4" />
//                 Silenciar
//               </>
//             )}
//           </Button>
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <ThermometerIcon className="h-4 w-4 text-orange-500" />
//             <span>Temp: {whitekonData?.registers[7] ? (whitekonData.registers[7] / 10).toFixed(1) : "N/A"} °C</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock className="h-4 w-4" />
//             <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
//           </div>
//         </div>
//       </div>

//      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Monitor WhiteKon {activeWhitekon}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <WhitekonMonitor whitekonId={activeWhitekon} />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Alarmes Ativos</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {alarms.length > 0 ? (
//               <div className="space-y-4">
//                 {alarms.map((alarm) => (
//                   <div
//                     key={alarm.id}
//                     className="p-3 border rounded-md bg-red-50 border-red-200 flex justify-between items-center"
//                   >
//                     <div>
//                       <p className="font-medium text-red-800">{alarm.type}</p>
//                       <p className="text-sm text-gray-500">WhiteKon {alarm.unit}</p>
//                     </div>
//                     <div className="text-sm text-gray-500">{alarm.time}</div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-6 text-gray-500">Nenhum alarme ativo</div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//         <Card>
//             <CardHeader>
//                 <CardTitle>Gráfico de Brancura (Última Hora)</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <ChartContainer config={{
//                     brancura: {
//                         label: "Brancura",
//                         color: "hsl(var(--chart-1))",
//                     },
//                 }} className="h-[250px] w-full">
//                     <AreaChart data={whitenessHistory}>
//                         <defs>
//                             <linearGradient id="colorBrancura" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="var(--color-brancura)" stopOpacity={0.8}/>
//                                 <stop offset="95%" stopColor="var(--color-brancura)" stopOpacity={0}/>
//                             </linearGradient>
//                         </defs>
//                         <CartesianGrid vertical={false} />
//                         <XAxis
//                             dataKey="time"
//                             tickLine={false}
//                             axisLine={false}
//                             tickMargin={8}
//                             tickFormatter={(value) => value}
//                         />
//                         <ChartTooltip
//                             cursor={false}
//                             content={<ChartTooltipContent indicator="dot" />}
//                         />
//                         <Area
//                             dataKey="value"
//                             type="natural"
//                             fill="url(#colorBrancura)"
//                             stroke="var(--color-brancura)"
//                             stackId="a"
//                         />
//                     </AreaChart>
//                 </ChartContainer>
//             </CardContent>
//         </Card>
//     </div>
//   )
// }







// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon, TrendingUp } from "lucide-react"
// import { WhitekonMonitor } from "@/components/whitekon-monitor"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { useToast } from "@/hooks/use-toast"
// import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, Line, TooltipProps } from "recharts"
// import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


// interface DashboardTabProps {
//   activeWhitekon: number
//   onWhitekonChangeAction: (id: number) => void
// }

// const chartConfig = {
//   brancuraMedia: {
//     label: "Brancura Média (%)",
//     color: "hsl(var(--chart-2))",
//   },
//   brancuraOnline: {
//     label: "Última Amostra (%)",
//     color: "hsl(var(--chart-1))",
//   },
//   contadorAmostras: {
//     label: "Contador de Amostras",
//     color: "hsl(var(--chart-4))",
//   },
// } satisfies ChartConfig

// export function DashboardTab({ activeWhitekon, onWhitekonChangeAction }: DashboardTabProps) {
//   const [silenceAlarms, setSilenceAlarms] = useState(false)
//   const [emergencyMode, setEmergencyMode] = useState(false)
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [alarms, setAlarms] = useState<any[]>([])

//   const { toast } = useToast()
//   const { isConnected, whitekonData, chartHistory } = useWhitekon()

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000)
//     return () => clearInterval(timer)
//   }, [])

//   useEffect(() => {
//     if (whitekonData?.registers?.[10] !== undefined) {
//       processAlarms(whitekonData.registers[10])
//     }
//   }, [whitekonData, activeWhitekon])

//   const processAlarms = (alarmBits: number) => {
//     const newAlarms = [];
//     if (alarmBits & (1 << 0)) newAlarms.push({ id: 1, type: "Escuro > Claro" });
//     if (alarmBits & (1 << 1)) newAlarms.push({ id: 2, type: "Escuro = Claro" });
//     if (alarmBits & (1 << 2)) newAlarms.push({ id: 3, type: "Saiu sem calibrar" });
//     setAlarms(newAlarms.map(a => ({ ...a, unit: activeWhitekon, time: new Date().toLocaleTimeString() })));
//   }

//   const handleEmergencyToggle = () => {
//     const newState = !emergencyMode
//     setEmergencyMode(newState)
//     toast({
//       title: `Modo de emergência ${newState ? 'ativado' : 'desativado'}`,
//       variant: newState ? "destructive" : "default",
//     })
//   }

//   const handleSilenceAlarmsToggle = () => {
//     const newState = !silenceAlarms
//     setSilenceAlarms(newState)
//     toast({ title: `Alarmes ${newState ? 'silenciados' : 'ativados'}` })
//   }

//   return (
//     <div className="grid gap-6">
//       <div className="flex flex-wrap justify-between items-center gap-4">
//         <div className="flex gap-2">
//           <Button
//             variant={emergencyMode ? "destructive" : "outline"}
//             onClick={handleEmergencyToggle}
//           >
//             <AlertCircle className="mr-2 h-4 w-4" />
//             Emergência
//           </Button>
//           <Button
//             variant={silenceAlarms ? "secondary" : "outline"}
//             onClick={handleSilenceAlarmsToggle}
//           >
//             {silenceAlarms ? <BellOff className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
//             {silenceAlarms ? 'Silêncio' : 'Silenciar'}
//           </Button>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <ThermometerIcon className="h-4 w-4 text-orange-500" />
//             <span>Temp: {whitekonData?.registers?.[7] != null ? (whitekonData.registers[7] / 10).toFixed(1) : "N/A"} °C</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock className="h-4 w-4" />
//             <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
//           </div>
//         </div>
//       </div>

//      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Monitor WhiteKon {activeWhitekon}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <WhitekonMonitor whitekonId={activeWhitekon} />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Alarmes Ativos</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {alarms.length > 0 ? (
//               <div className="space-y-4">
//                 {alarms.map((alarm) => (
//                   <div key={alarm.id} className="p-3 border rounded-md bg-red-50 border-red-200 flex justify-between items-center">
//                     <div>
//                       <p className="font-medium text-red-800">{alarm.type}</p>
//                       <p className="text-sm text-gray-500">WhiteKon {alarm.unit}</p>
//                     </div>
//                     <div className="text-sm text-gray-500">{alarm.time}</div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-6 text-gray-500">Nenhum alarme ativo</div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
      
//         <Card>
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5" />
//                     Gráfico de Leituras (Última Hora)
//                 </CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <ChartContainer config={chartConfig} className="h-[350px] w-full">
//                     <AreaChart data={chartHistory}>
//                         <defs>
//                             <linearGradient id="colorBrancuraMedia" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="var(--color-brancuraMedia)" stopOpacity={0.4}/>
//                                 <stop offset="95%" stopColor="var(--color-brancuraMedia)" stopOpacity={0}/>
//                             </linearGradient>
//                         </defs>
//                         <CartesianGrid vertical={false} />
//                         <XAxis
//                             dataKey="time"
//                             tickLine={false}
//                             axisLine={false}
//                             tickMargin={8}
//                         />
//                         <YAxis
//                           yAxisId="left"
//                           orientation="left"
//                           stroke="hsl(var(--chart-1))"
//                           tickLine={false}
//                           axisLine={false}
//                           tickMargin={8}
//                           name="Brancura"
//                         />
//                          <YAxis
//                           yAxisId="right"
//                           orientation="right"
//                           stroke="hsl(var(--chart-4))"
//                           tickLine={false}
//                           axisLine={false}
//                           tickMargin={8}
//                           name="Amostras"
//                         />
//                         <ChartTooltip
//                             cursor={false}
//                             content={<ChartTooltipContent indicator="dot" />}
//                         />
//                         <ChartLegend content={<ChartLegendContent />} />
//                         <Area
//                             yAxisId="left"
//                             dataKey="brancuraMedia"
//                             type="natural"
//                             fill="url(#colorBrancuraMedia)"
//                             stroke="var(--color-brancuraMedia)"
//                             strokeWidth={2}
//                             name="Brancura Média (%)"
//                         />
//                         <Line
//                             yAxisId="left"
//                             dataKey="brancuraOnline"
//                             name="Brancura Online (%)"
//                             type="natural"
//                             stroke="var(--color-brancuraOnline)"
//                             strokeWidth={2}
//                             dot={{ r: 4 }}
//                             activeDot={{ r: 6 }}
//                             connectNulls={false} 
//                         />
//                          <Line
//                           yAxisId="right"
//                           dataKey="contadorAmostras"
//                           name="Contador de Amostras"
//                           type="step"
//                           stroke="var(--color-contadorAmostras)"
//                           strokeWidth={2}
//                           strokeDasharray="3 3"
//                           dot={false}
//                         />
//                     </AreaChart>
//                 </ChartContainer>
//             </CardContent>
//         </Card>
//     </div>
//   )
// }





// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon, TrendingUp, RotateCcw } from "lucide-react"
// import { WhitekonMonitor } from "@/components/whitekon-monitor"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { useToast } from "@/hooks/use-toast"
// import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

// interface DashboardTabProps {
//   activeWhitekon: number
//   onWhitekonChangeAction: (id: number) => void
// }

// export function DashboardTab({ activeWhitekon, onWhitekonChangeAction }: DashboardTabProps) {
//   const [silenceAlarms, setSilenceAlarms] = useState(false)
//   const [emergencyMode, setEmergencyMode] = useState(false)
//   const [currentTime, setCurrentTime] = useState(new Date())
//   const [alarms, setAlarms] = useState<any[]>([])

//   const { toast } = useToast()
//   const { whitekonData, chartHistory, clearChartHistory } = useWhitekon()

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000)
//     return () => clearInterval(timer)
//   }, [])

//   useEffect(() => {
//     if (whitekonData?.registers?.[10] !== undefined) {
//       processAlarms(whitekonData.registers[10])
//     }
//   }, [whitekonData, activeWhitekon])

//   // Debug: Log do histórico sempre que mudar
//   useEffect(() => {
//     console.log('📊 Dashboard - Histórico do gráfico:', {
//       totalPoints: chartHistory.length,
//       lastPoint: chartHistory[chartHistory.length - 1],
//       samplePoints: chartHistory.slice(-3)
//     });
//   }, [chartHistory]);

//   const processAlarms = (alarmBits: number) => {
//     const newAlarms = [];
//     if (alarmBits & (1 << 0)) newAlarms.push({ id: 1, type: "Escuro > Claro" });
//     if (alarmBits & (1 << 1)) newAlarms.push({ id: 2, type: "Escuro = Claro" });
//     if (alarmBits & (1 << 2)) newAlarms.push({ id: 3, type: "Saiu sem calibrar" });
//     setAlarms(newAlarms.map(a => ({ ...a, unit: activeWhitekon, time: new Date().toLocaleTimeString() })));
//   }

//   const handleEmergencyToggle = () => {
//     const newState = !emergencyMode
//     setEmergencyMode(newState)
//     toast({
//       title: `Modo de emergência ${newState ? 'ativado' : 'desativado'}`,
//       variant: newState ? "destructive" : "default",
//     })
//   }

//   const handleSilenceAlarmsToggle = () => {
//     const newState = !silenceAlarms
//     setSilenceAlarms(newState)
//     toast({ title: `Alarmes ${newState ? 'silenciados' : 'ativados'}` })
//   }

//   const handleClearHistory = () => {
//     clearChartHistory()
//   }

//   // Formatador customizado para tooltip
//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
//           <p className="font-medium mb-2 text-gray-800">{`⏰ ${label}`}</p>
//           {payload.map((entry: any, index: number) => {
//             let displayValue = 'N/A';
//             let unit = '';
            
//             if (entry.value !== null && entry.value !== undefined) {
//               if (entry.dataKey === 'brancuraMedia' || entry.dataKey === 'brancuraOnline') {
//                 unit = '%';
//                 displayValue = entry.value.toFixed(2);
//               } else if (entry.dataKey === 'contadorAmostras') {
//                 displayValue = entry.value.toString();
//               }
//             }
            
//             return (
//               <p key={index} className="text-sm flex items-center">
//                 <span 
//                   className="w-3 h-3 rounded-full mr-2" 
//                   style={{ backgroundColor: entry.color }}
//                 ></span>
//                 <span className="font-medium">{entry.name}:</span>
//                 <span className="ml-1">{displayValue}{unit}</span>
//               </p>
//             );
//           })}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="grid gap-6">
//       <div className="flex flex-wrap justify-between items-center gap-4">
//         <div className="flex gap-2">
//           <Button
//             variant={emergencyMode ? "destructive" : "outline"}
//             onClick={handleEmergencyToggle}
//           >
//             <AlertCircle className="mr-2 h-4 w-4" />
//             Emergência
//           </Button>
//           <Button
//             variant={silenceAlarms ? "secondary" : "outline"}
//             onClick={handleSilenceAlarmsToggle}
//           >
//             {silenceAlarms ? <BellOff className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
//             {silenceAlarms ? 'Silêncio' : 'Silenciar'}
//           </Button>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <ThermometerIcon className="h-4 w-4 text-orange-500" />
//             <span>Temp: {whitekonData?.registers?.[7] != null ? (whitekonData.registers[7] / 10).toFixed(1) : "N/A"} °C</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock className="h-4 w-4" />
//             <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
//           </div>
//         </div>
//       </div>

//      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Monitor WhiteKon {activeWhitekon}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <WhitekonMonitor whitekonId={activeWhitekon} />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Alarmes Ativos</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {alarms.length > 0 ? (
//               <div className="space-y-4">
//                 {alarms.map((alarm) => (
//                   <div key={alarm.id} className="p-3 border rounded-md bg-red-50 border-red-200 flex justify-between items-center">
//                     <div>
//                       <p className="font-medium text-red-800">{alarm.type}</p>
//                       <p className="text-sm text-gray-500">WhiteKon {alarm.unit}</p>
//                     </div>
//                     <div className="text-sm text-gray-500">{alarm.time}</div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-6 text-gray-500">Nenhum alarme ativo</div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
      
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle className="flex items-center gap-2">
//             <TrendingUp className="h-5 w-5" />
//             Gráfico de Leituras (Última Hora)
//           </CardTitle>
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-muted-foreground">
//               Pontos: {chartHistory.length}
//             </span>
//             <Button variant="outline" size="sm" onClick={handleClearHistory}>
//               <RotateCcw className="h-4 w-4 mr-1" />
//               Limpar
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {chartHistory.length === 0 ? (
//             <div className="flex items-center justify-center h-[400px] text-gray-500">
//               <div className="text-center">
//                 <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                 <p>Aguardando dados...</p>
//                 <p className="text-sm">O gráfico será exibido quando houver dados disponíveis</p>
//               </div>
//             </div>
//           ) : (
//             <div className="h-[450px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <ComposedChart 
//                   data={chartHistory} 
//                   margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//                 >
//                   <defs>
//                     <linearGradient id="colorBrancuraMedia" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
//                     </linearGradient>
//                   </defs>
                  
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  
//                   <XAxis
//                     dataKey="time"
//                     tickLine={false}
//                     axisLine={true}
//                     tickMargin={8}
//                     angle={-45}
//                     textAnchor="end"
//                     height={60}
//                     interval="preserveStartEnd"
//                     minTickGap={30}
//                     fontSize={11}
//                     stroke="#6b7280"
//                   />
                  
//                   <YAxis
//                     yAxisId="brancura"
//                     orientation="left"
//                     stroke="#3b82f6"
//                     tickLine={false}
//                     axisLine={true}
//                     tickMargin={8}
//                     domain={['auto', 'auto']}
//                     label={{ value: 'Brancura (%)', angle: -90, position: 'insideLeft' }}
//                     fontSize={11}
//                   />
                  
//                   <YAxis
//                     yAxisId="amostras"
//                     orientation="right"
//                     stroke="#10b981"
//                     tickLine={false}
//                     axisLine={true}
//                     tickMargin={8}
//                     domain={['auto', 'auto']}
//                     label={{ value: 'Amostras', angle: 90, position: 'insideRight' }}
//                     fontSize={11}
//                   />
                  
//                   <Tooltip content={<CustomTooltip />} />
                  
//                   <Legend 
//                     wrapperStyle={{ paddingTop: '20px' }}
//                     iconType="line"
//                   />
                  
//                   {/* Área para Brancura Média */}
//                   <Area
//                     yAxisId="brancura"
//                     dataKey="brancuraMedia"
//                     type="monotone"
//                     fill="url(#colorBrancuraMedia)"
//                     stroke="#3b82f6"
//                     strokeWidth={2}
//                     name="Brancura Média (%)"
//                     connectNulls={false}
//                   />
                  
//                   {/* Linha para Brancura Online */}
//                   <Line
//                     yAxisId="brancura"
//                     dataKey="brancuraOnline"
//                     name="Brancura Online (%)"
//                     type="monotone"
//                     stroke="#ef4444"
//                     strokeWidth={2}
//                     dot={{ r: 2, fill: "#ef4444" }}
//                     activeDot={{ r: 4, fill: "#ef4444" }}
//                     connectNulls={false}
//                   />
                  
//                   {/* Linha para Contador de Amostras */}
//                   <Line
//                     yAxisId="amostras"
//                     dataKey="contadorAmostras"
//                     name="Contador Amostras"
//                     type="stepAfter"
//                     stroke="#10b981"
//                     strokeWidth={3}
//                     strokeDasharray="5 5"
//                     dot={{ r: 4, fill: "#10b981" }}
//                     activeDot={{ r: 6, fill: "#10b981" }}
//                     connectNulls={false}
//                   />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Card de Debug para verificar os dados */}
//       {process.env.NODE_ENV === 'development' && (
//         <Card>
//           <CardHeader>
//             <CardTitle>🔧 Debug - Últimos Dados</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//               <div>
//                 <h4 className="font-semibold mb-2">Registradores:</h4>
//                 <ul className="space-y-1">
//                   <li>Reg 5 (Brancura Média): {whitekonData?.registers?.[5] ?? 'null'}</li>
//                   <li>Reg 19 (Contador): {whitekonData?.registers?.[19] ?? 'null'}</li>
//                   <li>Reg 21 (Brancura Online): {whitekonData?.registers?.[21] ?? 'null'}</li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold mb-2">Último Ponto do Gráfico:</h4>
//                 {chartHistory.length > 0 ? (
//                   <ul className="space-y-1">
//                     <li>Tempo: {chartHistory[chartHistory.length - 1]?.time}</li>
//                     <li>Brancura Média: {chartHistory[chartHistory.length - 1]?.brancuraMedia}</li>
//                     <li>Contador: {chartHistory[chartHistory.length - 1]?.contadorAmostras}</li>
//                     <li>Brancura Online: {chartHistory[chartHistory.length - 1]?.brancuraOnline}</li>
//                   </ul>
//                 ) : (
//                   <p>Nenhum ponto no histórico</p>
//                 )}
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }




"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon, TrendingUp, RotateCcw } from "lucide-react"
import { WhitekonMonitor } from "@/components/whitekon-monitor"
import { useWhitekon } from "@/contexts/whitekon-context"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface DashboardTabProps {
  activeWhitekon: number
  onWhitekonChangeAction: (id: number) => void
}

// Mapeamento completo dos alarmes conforme registrador 10
const ALARM_TYPES = {
  0: { type: "CALIBRAÇÃO", description: "Escuro > Claro" },
  1: { type: "CALIBRAÇÃO", description: "Escuro = Claro (com margem)" },
  2: { type: "CALIBRAÇÃO", description: "Saiu do modo de calibração / calibrar os dois" },
  3: { type: "CALIBRAÇÃO", description: "Escuro > 3000" },
  4: { type: "CALIBRAÇÃO", description: "Claro < 4000" },
  5: { type: "CALIBRAÇÃO", description: "Muito tempo em modo de calibração" },
  6: { type: "CALIBRAÇÃO", description: "Indicação que foi realizada a calibração correta" },
  7: { type: "CALIBRAÇÃO", description: "RESERVADO" },
  8: { type: "FUNCIONAMENTO", description: "Valor de brancura muito alto" },
  9: { type: "FUNCIONAMENTO", description: "Valor de brancura muito baixo" },
  10: { type: "FUNCIONAMENTO", description: "Sem leitura do sensor (Blue = 0)" },
  11: { type: "FUNCIONAMENTO", description: "Erro na leitura de temperatura (T = 0)" },
  12: { type: "FUNCIONAMENTO", description: "Sensor desconectado brancura" },
  13: { type: "FUNCIONAMENTO", description: "RESERVADO" },
  14: { type: "FUNCIONAMENTO", description: "RESERVADO" },
  15: { type: "FUNCIONAMENTO", description: "RESERVADO" }
}

export function DashboardTab({ activeWhitekon, onWhitekonChangeAction }: DashboardTabProps) {
  const [silenceAlarms, setSilenceAlarms] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [alarms, setAlarms] = useState<any[]>([])

  const { toast } = useToast()
  const { whitekonData, chartHistory, clearChartHistory } = useWhitekon()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (whitekonData?.registers?.[10] !== undefined) {
      processAlarms(whitekonData.registers[10])
    }
  }, [whitekonData, activeWhitekon])

  // Debug: Log do histórico sempre que mudar
  useEffect(() => {
    console.log('📊 Dashboard - Histórico do gráfico:', {
      totalPoints: chartHistory.length,
      lastPoint: chartHistory[chartHistory.length - 1],
      samplePoints: chartHistory.slice(-3)
    });
  }, [chartHistory]);

  const processAlarms = (alarmBits: number) => {
    const newAlarms = [];
    
    // Verifica todos os 16 bits possíveis
    for (let bit = 0; bit <= 15; bit++) {
      if (alarmBits & (1 << bit)) {
        const alarmInfo = ALARM_TYPES[bit as keyof typeof ALARM_TYPES];
        if (alarmInfo) {
          newAlarms.push({
            id: bit,
            bit: bit,
            type: alarmInfo.type,
            description: alarmInfo.description,
            unit: activeWhitekon,
            time: new Date().toLocaleTimeString('pt-BR'),
            priority: alarmInfo.type === "FUNCIONAMENTO" ? "high" : "medium"
          });
        }
      }
    }
    
    console.log('🚨 Alarmes processados:', {
      alarmBits: alarmBits.toString(2).padStart(16, '0'), // Mostra em binário
      alarmsFound: newAlarms.length,
      alarms: newAlarms
    });
    
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
    clearChartHistory()
  }

  // Formatador customizado para tooltip
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
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></span>
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
          <Button
            variant={emergencyMode ? "destructive" : "outline"}
            onClick={handleEmergencyToggle}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Emergência
          </Button>
          <Button
            variant={silenceAlarms ? "secondary" : "outline"}
            onClick={handleSilenceAlarmsToggle}
          >
            {silenceAlarms ? <BellOff className="mr-2 h-4 w-4" /> : <Bell className="mr-2 h-4 w-4" />}
            {silenceAlarms ? 'Silêncio' : 'Silenciar'}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ThermometerIcon className="h-4 w-4 text-orange-500" />
            <span>Temp: {whitekonData?.registers?.[7] != null ? (whitekonData.registers[7] / 10).toFixed(1) : "N/A"} °C</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
          </div>
        </div>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monitor WhiteKon {activeWhitekon}</CardTitle>
          </CardHeader>
          <CardContent>
            <WhitekonMonitor whitekonId={activeWhitekon} />
          </CardContent>
        </Card>

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
                {alarms.map((alarm) => (
                  <div 
                    key={`${alarm.unit}-${alarm.bit}`} 
                    className={`p-3 border rounded-md flex justify-between items-start ${
                      alarm.priority === 'high' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          alarm.type === 'FUNCIONAMENTO' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alarm.type}
                        </span>
                        <span className="text-xs text-gray-500">Bit {alarm.bit}</span>
                      </div>
                      <p className={`font-medium text-sm ${
                        alarm.priority === 'high' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {alarm.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">WhiteKon {alarm.unit}</p>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {alarm.time}
                    </div>
                  </div>
                ))}
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
              Pontos: {chartHistory.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleClearHistory}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartHistory.length === 0 ? (
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
                <ComposedChart 
                  data={chartHistory} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="colorBrancuraMedia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  
                  <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval="preserveStartEnd"
                    minTickGap={30}
                    fontSize={11}
                    stroke="#6b7280"
                  />
                  
                  <YAxis
                    yAxisId="brancura"
                    orientation="left"
                    stroke="#3b82f6"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                    domain={['auto', 'auto']}
                    label={{ value: 'Brancura (%)', angle: -90, position: 'insideLeft' }}
                    fontSize={11}
                  />
                  
                  <YAxis
                    yAxisId="amostras"
                    orientation="right"
                    stroke="#10b981"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                    domain={['auto', 'auto']}
                    label={{ value: 'Amostras', angle: 90, position: 'insideRight' }}
                    fontSize={11}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  
                  {/* Área para Brancura Média */}
                  <Area
                    yAxisId="brancura"
                    dataKey="brancuraMedia"
                    type="monotone"
                    fill="url(#colorBrancuraMedia)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Brancura Média (%)"
                    connectNulls={false}
                  />
                  
                  {/* Linha para Brancura Online */}
                  <Line
                    yAxisId="brancura"
                    dataKey="brancuraOnline"
                    name="Brancura Online (%)"
                    type="monotone"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 2, fill: "#ef4444" }}
                    activeDot={{ r: 4, fill: "#ef4444" }}
                    connectNulls={false}
                  />
                  
                  {/* Linha para Contador de Amostras */}
                  <Line
                    yAxisId="amostras"
                    dataKey="contadorAmostras"
                    name="Contador Amostras"
                    type="stepAfter"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6, fill: "#10b981" }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
