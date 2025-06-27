// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { WhiteKonStorage } from "@/lib/whitekon-storage"
// import type { WhiteKon } from "@/lib/types"
// import { Plus, Settings, Trash2, Wifi, WifiOff } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

// export default function ListaWhiteKonPage() {
//   const [devices, setDevices] = useState<WhiteKon[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   const router = useRouter()
//   const { toast } = useToast()

//   useEffect(() => {
//     loadDevices()
//   }, [])

//   const loadDevices = () => {
//     try {
//       const loadedDevices = WhiteKonStorage.getAll()
//       setDevices(loadedDevices)
//     } catch (error) {
//       console.error("Erro ao carregar dispositivos:", error)
//       toast({
//         title: "Erro",
//         description: "Erro ao carregar a lista de dispositivos",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleDelete = (device: WhiteKon) => {
//     if (confirm(`Tem certeza que deseja excluir o WhiteKon "${device.name}"?`)) {
//       try {
//         WhiteKonStorage.delete(device.id)
//         loadDevices()
//         toast({
//           title: "WhiteKon excluído",
//           description: `${device.name} foi removido do sistema`,
//         })
//       } catch (error) {
//         console.error("Erro ao excluir dispositivo:", error)
//         toast({
//           title: "Erro",
//           description: "Erro ao excluir o dispositivo",
//           variant: "destructive",
//         })
//       }
//     }
//   }

//   const handleManage = (device: WhiteKon) => {
//     router.push(`/whitekon/gerenciar/${device.id}`)
//   }

//   if (isLoading) {
//     return (
//       <div className="container mx-auto p-4">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-lg">Carregando dispositivos...</div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">WhiteKons Cadastrados</h1>
//         <Button
//           onClick={() => router.push("/whitekon/cadastro")}
//           className="bg-[#00A651] hover:bg-[#008a43] text-white"
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Novo WhiteKon
//         </Button>
//       </div>

//       {devices.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <div className="text-center">
//               <h3 className="text-lg font-medium mb-2">Nenhum WhiteKon cadastrado</h3>
//               <p className="text-gray-500 mb-4">Cadastre seu primeiro medidor de brancura para começar</p>
//               <Button
//                 onClick={() => router.push("/whitekon/cadastro")}
//                 className="bg-[#00A651] hover:bg-[#008a43] text-white"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Cadastrar WhiteKon
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {devices.map((device) => (
//             <Card key={device.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader className="pb-3">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <CardTitle className="text-lg">{device.name}</CardTitle>
//                     <p className="text-sm text-gray-500 mt-1">RTU: {device.rtuAddress}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {device.isConnected ? (
//                       <Wifi className="h-4 w-4 text-green-500" />
//                     ) : (
//                       <WifiOff className="h-4 w-4 text-gray-400" />
//                     )}
//                     <Badge variant={device.isConnected ? "default" : "secondary"}>
//                       {device.isConnected ? "Conectado" : "Desconectado"}
//                     </Badge>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div>
//                   <p className="text-sm font-medium">Máquina:</p>
//                   <p className="text-sm text-gray-600">{device.machineName}</p>
//                 </div>

//                 {device.port && (
//                   <div>
//                     <p className="text-sm font-medium">Porta:</p>
//                     <p className="text-sm text-gray-600">
//                       {device.port} @ {device.baudRate} bps
//                     </p>
//                   </div>
//                 )}

//                 <div>
//                   <p className="text-sm font-medium">Cadastrado em:</p>
//                   <p className="text-sm text-gray-600">{device.createdAt.toLocaleDateString("pt-BR")}</p>
//                 </div>

//                 {device.lastConnection && (
//                   <div>
//                     <p className="text-sm font-medium">Última conexão:</p>
//                     <p className="text-sm text-gray-600">{device.lastConnection.toLocaleString("pt-BR")}</p>
//                   </div>
//                 )}

//                 <div className="flex gap-2 pt-2">
//                   <Button
//                     size="sm"
//                     onClick={() => handleManage(device)}
//                     className="flex-1 bg-[#00A651] hover:bg-[#008a43] text-white"
//                   >
//                     <Settings className="h-4 w-4 mr-1" />
//                     Gerenciar
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleDelete(device)}
//                     className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }








// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent } from "@/components/ui/card"
// import { WhiteKonStorage } from "@/lib/whitekon-storage"
// import type { WhiteKon } from "@/lib/types"
// import { Plus, Loader2, Settings, Edit, Trash2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { WhiteKonCard } from "@/components/whitekon-card"

// export default function ListaWhiteKonPage() {
//   const [devices, setDevices] = useState<WhiteKon[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [editingDevice, setEditingDevice] = useState<WhiteKon | null>(null)
  
//   const [editName, setEditName] = useState("")
//   const [editMachineName, setEditMachineName] = useState("")

//   const router = useRouter()
//   const { toast } = useToast()

//   const loadDevices = () => {
//     try {
//       const loadedDevices = WhiteKonStorage.getAll()
//       setDevices(loadedDevices.sort((a, b) => a.rtuAddress - b.rtuAddress));
//     } catch (error) {
//       console.error("Erro ao carregar dispositivos:", error)
//       toast({
//         title: "Erro",
//         description: "Erro ao carregar a lista de dispositivos",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadDevices()
//   }, [])

//   const handleDelete = (device: WhiteKon) => {
//     if (confirm(`Tem certeza que deseja excluir o WhiteKon "${device.name}"?`)) {
//       try {
//         WhiteKonStorage.delete(device.id)
//         loadDevices()
//         toast({
//           title: "WhiteKon excluído",
//           description: `${device.name} foi removido com sucesso.`,
//         })
//       } catch (error) {
//         toast({
//           title: "Erro ao excluir",
//           description: "Não foi possível remover o dispositivo.",
//           variant: "destructive",
//         })
//       }
//     }
//   }

//   const handleEdit = (device: WhiteKon) => {
//     setEditingDevice(device);
//     setEditName(device.name);
//     setEditMachineName(device.machineName);
//   }

//   const handleSaveEdit = () => {
//     if (!editingDevice || !editName.trim() || !editMachineName.trim()) {
//         toast({ title: "Erro de Validação", description: "Nome e Máquina são obrigatórios.", variant: "destructive" });
//         return;
//     }

//     setIsSubmitting(true);
//     try {
//         WhiteKonStorage.update(editingDevice.id, {
//             name: editName.trim(),
//             machineName: editMachineName.trim(),
//         });
//         toast({ title: "Sucesso!", description: "Dados do WhiteKon atualizados." });
//         setEditingDevice(null);
//         loadDevices();
//     } catch(error) {
//         toast({ title: "Erro ao Salvar", description: "Não foi possível atualizar os dados.", variant: "destructive" });
//     } finally {
//         setIsSubmitting(false);
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="container mx-auto p-4 flex justify-center items-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">WhiteKons Cadastrados</h1>
//         <Button onClick={() => router.push("/whitekon/cadastro")}>
//           <Plus className="h-4 w-4 mr-2" />
//           Novo WhiteKon
//         </Button>
//       </div>

//       {devices.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <h3 className="text-lg font-medium mb-2">Nenhum WhiteKon cadastrado</h3>
//             <p className="text-muted-foreground mb-4">Cadastre seu primeiro medidor para começar.</p>
//             <Button onClick={() => router.push("/whitekon/cadastro")}>
//               <Plus className="h-4 w-4 mr-2" />
//               Cadastrar WhiteKon
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//           {devices.map((device) => (
//             // [FIX] O Card agora é renderizado e os botões são adicionados aqui
//             <div key={device.id} className="flex flex-col">
//               <WhiteKonCard device={device} />
//               <div className="flex gap-2 p-4 pt-0 -mt-2">
//                   <Button size="sm" onClick={() => router.push(`/whitekon/gerenciar/${device.id}`)} className="flex-1">
//                       <Settings className="h-4 w-4 mr-1" />
//                       Gerenciar
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={() => handleEdit(device)}>
//                       <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button size="sm" variant="destructive" onClick={() => handleDelete(device)}>
//                       <Trash2 className="h-4 w-4" />
//                   </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* O Dialog de Edição permanece aqui, pois seu estado é controlado por esta página */}
//       <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Editar WhiteKon</DialogTitle>
//             <DialogDescription>
//               Altere as informações de cadastro do dispositivo. Endereço RTU não pode ser alterado.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="name" className="text-right">Nome</Label>
//               <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} className="col-span-3" />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="machineName" className="text-right">Máquina</Label>
//               <Input id="machineName" value={editMachineName} onChange={e => setEditMachineName(e.target.value)} className="col-span-3" />
//             </div>
//           </div>
//           <DialogFooter>
//             <DialogClose asChild>
//                 <Button type="button" variant="secondary">Cancelar</Button>
//             </DialogClose>
//             <Button type="submit" onClick={handleSaveEdit} disabled={isSubmitting}>
//               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Salvar Alterações
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }








// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent } from "@/components/ui/card" // Usado para o placeholder
// import { WhiteKonStorage } from "@/lib/whitekon-storage"
// import type { WhiteKon } from "@/lib/types"
// import { Plus, Loader2 } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { WhiteKonCard } from "@/components/whitekon-card" // Importamos o card aprimorado

// export default function ListaWhiteKonPage() {
//   const [devices, setDevices] = useState<WhiteKon[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [editingDevice, setEditingDevice] = useState<WhiteKon | null>(null)
  
//   const [editName, setEditName] = useState("")
//   const [editMachineName, setEditMachineName] = useState("")

//   const router = useRouter()
//   const { toast } = useToast()

//   const loadDevices = () => {
//     try {
//       const loadedDevices = WhiteKonStorage.getAll()
//       setDevices(loadedDevices.sort((a, b) => a.rtuAddress - b.rtuAddress));
//     } catch (error) {
//       console.error("Erro ao carregar dispositivos:", error)
//       toast({
//         title: "Erro",
//         description: "Erro ao carregar a lista de dispositivos",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadDevices()
//   }, [])
  
//   const handleOpenEditModal = (device: WhiteKon) => {
//     setEditingDevice(device);
//     setEditName(device.name);
//     setEditMachineName(device.machineName);
//   }

//   const handleDeleteDevice = (device: WhiteKon) => {
//     if (confirm(`Tem certeza que deseja excluir o WhiteKon "${device.name}"?`)) {
//       try {
//         WhiteKonStorage.delete(device.id)
//         loadDevices()
//         toast({
//           title: "WhiteKon excluído",
//           description: `${device.name} foi removido com sucesso.`,
//         })
//       } catch (error) {
//         toast({
//           title: "Erro ao excluir",
//           description: "Não foi possível remover o dispositivo.",
//           variant: "destructive",
//         })
//       }
//     }
//   }

//   const handleSaveEdit = () => {
//     if (!editingDevice || !editName.trim() || !editMachineName.trim()) {
//         toast({ title: "Erro de Validação", description: "Nome e Máquina são obrigatórios.", variant: "destructive" });
//         return;
//     }

//     setIsSubmitting(true);
//     try {
//         WhiteKonStorage.update(editingDevice.id, {
//             name: editName.trim(),
//             machineName: editMachineName.trim(),
//         });
//         toast({ title: "Sucesso!", description: "Dados do WhiteKon atualizados." });
//         setEditingDevice(null);
//         loadDevices();
//     } catch(error) {
//         toast({ title: "Erro ao Salvar", description: "Não foi possível atualizar os dados.", variant: "destructive" });
//     } finally {
//         setIsSubmitting(false);
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="container mx-auto p-4 flex justify-center items-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">WhiteKons Cadastrados</h1>
//         <Button onClick={() => router.push("/whitekon/cadastro")}>
//           <Plus className="h-4 w-4 mr-2" />
//           Novo WhiteKon
//         </Button>
//       </div>

//       {devices.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <h3 className="text-lg font-medium mb-2">Nenhum WhiteKon cadastrado</h3>
//             <p className="text-muted-foreground mb-4">Cadastre seu primeiro medidor para começar.</p>
//             <Button onClick={() => router.push("/whitekon/cadastro")}>
//               <Plus className="h-4 w-4 mr-2" />
//               Cadastrar WhiteKon
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//           {devices.map((device) => (
//             <WhiteKonCard
//               key={device.id}
//               device={device}
//               // [FIX] Passando as funções diretamente. O linter não deve mais reclamar.
//               onEdit={() => handleOpenEditModal(device)}
//               onDelete={() => handleDeleteDevice(device)}
//             />
//           ))}
//         </div>
//       )}

//       {/* O Dialog de Edição permanece aqui, pois seu estado é controlado por esta página */}
//       <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Editar WhiteKon</DialogTitle>
//             <DialogDescription>
//               Altere as informações de cadastro do dispositivo. Endereço RTU não pode ser alterado.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="name" className="text-right">Nome</Label>
//               <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} className="col-span-3" />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="machineName" className="text-right">Máquina</Label>
//               <Input id="machineName" value={editMachineName} onChange={e => setEditMachineName(e.target.value)} className="col-span-3" />
//             </div>
//           </div>
//           <DialogFooter>
//             <DialogClose asChild>
//                 <Button type="button" variant="secondary">Cancelar</Button>
//             </DialogClose>
//             <Button type="submit" onClick={handleSaveEdit} disabled={isSubmitting}>
//               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Salvar Alterações
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }







// app/whitekon/lista/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card as UICard, CardContent as UICardContent } from "@/components/ui/card" // Renomeado para evitar conflito
import { WhiteKonStorage } from "@/lib/whitekon-storage"
import type { WhiteKon } from "@/lib/types"
import { Plus, Loader2, Settings, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WhiteKonCard } from "@/components/whitekon-card"

export default function ListaWhiteKonPage() {
  const [devices, setDevices] = useState<WhiteKon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingDevice, setEditingDevice] = useState<WhiteKon | null>(null)
  
  const [editName, setEditName] = useState("")
  const [editMachineName, setEditMachineName] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  const loadDevices = () => {
    try {
      const loadedDevices = WhiteKonStorage.getAll()
      setDevices(loadedDevices.sort((a, b) => a.rtuAddress - b.rtuAddress));
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

  useEffect(() => {
    loadDevices()
  }, [])
  
  const handleOpenEditModal = (device: WhiteKon) => {
    setEditingDevice(device);
    setEditName(device.name);
    setEditMachineName(device.machineName);
  }

  const handleDeleteDevice = (device: WhiteKon) => {
    if (confirm(`Tem certeza que deseja excluir o WhiteKon "${device.name}"?`)) {
      try {
        WhiteKonStorage.delete(device.id)
        loadDevices()
        toast({
          title: "WhiteKon excluído",
          description: `${device.name} foi removido com sucesso.`,
        })
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível remover o dispositivo.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSaveEdit = () => {
    if (!editingDevice || !editName.trim() || !editMachineName.trim()) {
        toast({ title: "Erro de Validação", description: "Nome e Máquina são obrigatórios.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
        WhiteKonStorage.update(editingDevice.id, {
            name: editName.trim(),
            machineName: editMachineName.trim(),
        });
        toast({ title: "Sucesso!", description: "Dados do WhiteKon atualizados." });
        setEditingDevice(null);
        loadDevices();
    } catch(error) {
        toast({ title: "Erro ao Salvar", description: "Não foi possível atualizar os dados.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">WhiteKons Cadastrados</h1>
        <Button onClick={() => router.push("/whitekon/cadastro")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo WhiteKon
        </Button>
      </div>

      {devices.length === 0 ? (
        <UICard>
          <UICardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">Nenhum WhiteKon cadastrado</h3>
            <p className="text-muted-foreground mb-4">Cadastre seu primeiro medidor para começar.</p>
            <Button onClick={() => router.push("/whitekon/cadastro")}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar WhiteKon
            </Button>
          </UICardContent>
        </UICard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => (
            // [FIX] O Card e os botões agora são agrupados em um `div` com flexbox
            <div key={device.id} className="flex flex-col bg-card border rounded-lg shadow-sm">
                <WhiteKonCard device={device} />
                <div className="flex gap-2 p-4 pt-2">
                    <Button size="sm" onClick={() => router.push(`/whitekon/gerenciar/${device.id}`)} className="flex-grow-[2]">
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(device)} className="flex-grow">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteDevice(device)} className="flex-grow">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* O Dialog de Edição permanece aqui, sem alterações */}
      <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar WhiteKon</DialogTitle>
            <DialogDescription>
              Altere as informações de cadastro do dispositivo. Endereço RTU não pode ser alterado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="machineName" className="text-right">Máquina</Label>
              <Input id="machineName" value={editMachineName} onChange={e => setEditMachineName(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}