// "use client"

// import { useState, useEffect } from "react"
// import type { WhiteKon } from "@/lib/types"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Wifi, WifiOff } from "lucide-react"

// // [FIX] As props de função foram removidas
// interface WhiteKonCardProps {
//   device: WhiteKon
// }

// interface RealtimeData {
//   tempCalibracao: string | null
//   tempOnline: string | null
//   blue: number | null
//   brancura: string | null
//   brancuraOnline: string | null
//   desvioPadrao: string | null
//   qtdAmostras: number | null
//   modoOperacao: string | null
// }

// export function WhiteKonCard({ device }: WhiteKonCardProps) {
//   const { isConnected, connectionParams, whitekonData } = useWhitekon()
//   const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null)

//   const isThisDeviceConnected = isConnected && connectionParams?.address === String(device.rtuAddress)

//   useEffect(() => {
//     if (isThisDeviceConnected && whitekonData?.registers) {
//       const registers = whitekonData.registers
      
//       const getModoOperacao = (code: number | null) => {
//         if (code === null) return "Indefinido";
//         switch (code) {
//           case 0: return "Normal";
//           case 1: return "Calibração";
//           case 2: return "Limpeza";
//           case 3: return "Máquina Parada";
//           default: return "Desconhecido";
//         }
//       }

//       setRealtimeData({
//         tempCalibracao: registers[6] !== null && registers[6] !== 65535 ? (registers[6] / 10).toFixed(1) + " °C" : "---",
//         tempOnline: registers[7] !== null ? (registers[7] / 10).toFixed(1) + " °C" : "---",
//         blue: registers[17] ?? null,
//         brancura: registers[5] !== null ? (registers[5] / 10).toFixed(1) + " %" : "---",
//         brancuraOnline: registers[21] !== null ? (registers[21] / 10).toFixed(1) + " %" : "---",
//         desvioPadrao: registers[11] !== null ? (registers[11] / 100).toFixed(2) + " %" : "---",
//         qtdAmostras: registers[19] ?? null,
//         modoOperacao: getModoOperacao(registers[0]),
//       })
//     } else {
//       setRealtimeData(null)
//     }
//   }, [whitekonData, isThisDeviceConnected])

//   const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
//     <div className="flex justify-between items-center text-sm">
//       <p className="text-muted-foreground">{label}:</p>
//       <p className="font-mono font-medium">{value ?? "---"}</p>
//     </div>
//   )

//   return (
//     // [FIX] A classe foi ajustada para funcionar sem os botões e ter uma margem inferior
//     <Card className={`transition-shadow hover:shadow-lg flex-grow ${isThisDeviceConnected ? 'border-primary border-2' : ''}`}>
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg">{device.name}</CardTitle>
//           <Badge variant={isThisDeviceConnected ? "default" : "secondary"}>
//             {isThisDeviceConnected ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
//             {isThisDeviceConnected ? "Conectado" : "Desconectado"}
//           </Badge>
//         </div>
//         <p className="text-xs text-muted-foreground pt-1">
//           RTU: {device.rtuAddress} | Máquina: {device.machineName}
//         </p>
//       </CardHeader>
//       {/* [FIX] Adicionado mb-4 para dar espaço para os botões que agora estão no componente pai */}
//       <CardContent className="space-y-4 pb-4">
//         <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/20">
//           <InfoRow label="Temp. Calibração" value={realtimeData?.tempCalibracao ?? null} />
//           <InfoRow label="Temp. Online" value={realtimeData?.tempOnline ?? null} />
//           <InfoRow label="Blue" value={realtimeData?.blue ?? null} />
//           <InfoRow label="Brancura" value={realtimeData?.brancura ?? null} />
//           <InfoRow label="Brancura Online" value={realtimeData?.brancuraOnline ?? null} />
//           <InfoRow label="Desvio Padrão" value={realtimeData?.desvioPadrao ?? null} />
//           <InfoRow label="Amostras" value={realtimeData?.qtdAmostras ?? null} />
//           <InfoRow label="Modo Operação" value={realtimeData?.modoOperacao ?? null} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }





// // components/whitekon-card.tsx

// "use client"

// import { useState, useEffect } from "react"
// import type { WhiteKon } from "@/lib/types"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Settings, Edit, Trash2, Wifi, WifiOff } from "lucide-react"
// import { useRouter } from "next/navigation"

// interface WhiteKonCardProps {
//   device: WhiteKon;
//   onEdit: () => void;      // [FIX] Simplificado para não passar o objeto 'device'
//   onDelete: () => void;     // [FIX] Simplificado para não passar o objeto 'device'
// }

// interface RealtimeData {
//   tempCalibracao: string | null;
//   tempOnline: string | null;
//   blue: number | null;
//   brancura: string | null;
//   brancuraOnline: string | null;
//   desvioPadrao: string | null;
//   qtdAmostras: number | null;
//   modoOperacao: string | null;
// }

// export function WhiteKonCard({ device, onEdit, onDelete }: WhiteKonCardProps) {
//   const router = useRouter();
//   const { isConnected, connectionParams, whitekonData } = useWhitekon();
//   const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);

//   const isThisDeviceConnected = isConnected && connectionParams?.address === String(device.rtuAddress);

//   const updateDisplayData = () => {
//     if (isThisDeviceConnected && whitekonData?.registers) {
//       const registers = whitekonData.registers;
      
//       const getModoOperacao = (code: number | null) => {
//         if (code === null) return "Indefinido";
//         switch (code) {
//           case 0: return "Normal";
//           case 1: return "Calibração";
//           case 2: return "Limpeza";
//           case 3: return "Máquina Parada";
//           default: return "Desconhecido";
//         }
//       };

//       setRealtimeData({
//         tempCalibracao: registers[6] !== null && registers[6] !== 65535 ? (registers[6] / 10).toFixed(1) + " °C" : "---",
//         tempOnline: registers[7] !== null ? (registers[7] / 10).toFixed(1) + " °C" : "---",
//         blue: registers[17] ?? null,
//         brancura: registers[5] !== null ? (registers[5] / 10).toFixed(1) + " %" : "---",
//         brancuraOnline: registers[21] !== null ? (registers[21] / 10).toFixed(1) + " %" : "---",
//         desvioPadrao: registers[11] !== null ? (registers[11] / 100).toFixed(2) + " %" : "---",
//         qtdAmostras: registers[19] ?? null,
//         modoOperacao: getModoOperacao(registers[0]),
//       });
//     } else if (realtimeData !== null) {
//       setRealtimeData(null); // Limpa os dados se o dispositivo for desconectado
//     }
//   };
  
//   // [NOVO] Efeito para atualização em tempo real
//   useEffect(() => {
//     if (isThisDeviceConnected) {
//       // Atualiza imediatamente quando o componente se torna o ativo
//       updateDisplayData(); 
//       // Cria um intervalo que força a re-renderização dos dados a cada segundo
//       const interval = setInterval(updateDisplayData, 1000); 
//       return () => clearInterval(interval); // Limpa o intervalo quando o componente não for mais o ativo
//     }
//   }, [isThisDeviceConnected, whitekonData]); // Depende da conexão e dos dados gerais

//   const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
//     <div className="flex justify-between items-center text-sm">
//       <p className="text-muted-foreground">{label}:</p>
//       <p className="font-mono font-medium">{value ?? "---"}</p>
//     </div>
//   );

//   return (
//     <Card className={`transition-all hover:shadow-xl flex flex-col ${isThisDeviceConnected ? 'border-primary border-2' : ''}`}>
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg">{device.name}</CardTitle>
//           <Badge variant={isThisDeviceConnected ? "default" : "secondary"}>
//             {isThisDeviceConnected ? <Wifi className="h-4 w-4 mr-2 animate-pulse" /> : <WifiOff className="h-4 w-4 mr-2" />}
//             {isThisDeviceConnected ? "Conectado" : "Desconectado"}
//           </Badge>
//         </div>
//         <p className="text-xs text-muted-foreground pt-1">
//           RTU: {device.rtuAddress} | Máquina: {device.machineName}
//         </p>
//       </CardHeader>
//       <CardContent className="space-y-4 flex-grow">
//         <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/20">
//           <InfoRow label="Temp. Calibração" value={realtimeData?.tempCalibracao ?? null} />
//           <InfoRow label="Temp. Online" value={realtimeData?.tempOnline ?? null} />
//           <InfoRow label="Blue" value={realtimeData?.blue ?? null} />
//           <InfoRow label="Brancura" value={realtimeData?.brancura ?? null} />
//           <InfoRow label="Brancura Online" value={realtimeData?.brancuraOnline ?? null} />
//           <InfoRow label="Desvio Padrão" value={realtimeData?.desvioPadrao ?? null} />
//           <InfoRow label="Amostras" value={realtimeData?.qtdAmostras ?? null} />
//           <InfoRow label="Modo Operação" value={realtimeData?.modoOperacao ?? null} />
//         </div>
//       </CardContent>
//       {/* [FIX] Botões movidos para o CardFooter para melhor semântica e layout */}
//       <CardFooter className="flex gap-2 pt-2">
//         <Button size="sm" onClick={() => router.push(`/whitekon/gerenciar/${device.id}`)} className="flex-grow">
//           <Settings className="h-4 w-4 mr-2" />
//           Gerenciar
//         </Button>
//         <Button size="sm" variant="outline" onClick={onEdit}>
//           <Edit className="h-4 w-4" />
//         </Button>
//         <Button size="sm" variant="destructive" onClick={onDelete}>
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }






// // components/whitekon-card.tsx

// "use client"

// import { useState, useEffect } from "react"
// import type { WhiteKon } from "@/lib/types"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Wifi, WifiOff } from "lucide-react"

// // [FIX] Removidas as props de função para resolver o erro de serialização.
// interface WhiteKonCardProps {
//   device: WhiteKon
// }

// interface RealtimeData {
//   tempCalibracao: string | null
//   tempOnline: string | null
//   blue: number | null
//   brancura: string | null
//   brancuraOnline: string | null
//   desvioPadrao: string | null
//   qtdAmostras: number | null
//   modoOperacao: string | null
// }

// export function WhiteKonCard({ device }: WhiteKonCardProps) {
//   const { isConnected, connectionParams, whitekonData } = useWhitekon()
//   const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null)

//   const isThisDeviceConnected = isConnected && connectionParams?.address === String(device.rtuAddress)

//   const updateDisplayData = () => {
//     if (isThisDeviceConnected && whitekonData?.registers) {
//       const registers = whitekonData.registers
      
//       const getModoOperacao = (code: number | null) => {
//         if (code === null) return "Indefinido"
//         switch (code) {
//           case 0: return "Normal"
//           case 1: return "Calibração"
//           case 2: return "Limpeza"
//           case 3: return "Máquina Parada"
//           default: return "Desconhecido"
//         }
//       }

//       setRealtimeData({
//         tempCalibracao: registers[6] !== null && registers[6] !== 65535 ? (registers[6] / 10).toFixed(1) + " °C" : "---",
//         tempOnline: registers[7] !== null ? (registers[7] / 10).toFixed(1) + " °C" : "---",
//         blue: registers[17] ?? null,
//         brancura: registers[5] !== null ? (registers[5] / 10).toFixed(1) + " %" : "---",
//         brancuraOnline: registers[21] !== null ? (registers[21] / 10).toFixed(1) + " %" : "---",
//         desvioPadrao: registers[11] !== null ? (registers[11] / 100).toFixed(2) + " %" : "---",
//         qtdAmostras: registers[19] ?? null,
//         modoOperacao: getModoOperacao(registers[0]),
//       })
//     } else if (realtimeData !== null) {
//       setRealtimeData(null)
//     }
//   }

//   // Lógica de atualização em tempo real
//   useEffect(() => {
//     let interval: NodeJS.Timeout | null = null
//     if (isThisDeviceConnected) {
//       updateDisplayData()
//       interval = setInterval(updateDisplayData, 1000)
//     }
//     return () => {
//       if (interval) clearInterval(interval)
//     }
//   }, [isThisDeviceConnected, whitekonData])

//   const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
//     <div className="flex justify-between items-center text-sm">
//       <p className="text-muted-foreground">{label}:</p>
//       <p className="font-mono font-medium">{value ?? "---"}</p>
//     </div>
//   )

//   return (
//     // [FIX] O Card agora não tem rodapé, ele ocupará o espaço e o pai adicionará os botões.
//     <Card className={`transition-all hover:shadow-xl flex-grow ${isThisDeviceConnected ? 'border-primary border-2' : ''}`}>
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg">{device.name}</CardTitle>
//           <Badge variant={isThisDeviceConnected ? "default" : "secondary"}>
//             {isThisDeviceConnected ? <Wifi className="h-4 w-4 mr-2 animate-pulse" /> : <WifiOff className="h-4 w-4 mr-2" />}
//             {isThisDeviceConnected ? "Conectado" : "Desconectado"}
//           </Badge>
//         </div>
//         <p className="text-xs text-muted-foreground pt-1">
//           RTU: {device.rtuAddress} | Máquina: {device.machineName}
//         </p>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/20">
//           <InfoRow label="Temp. Calibração" value={realtimeData?.tempCalibracao ?? null} />
//           <InfoRow label="Temp. Online" value={realtimeData?.tempOnline ?? null} />
//           <InfoRow label="Blue" value={realtimeData?.blue ?? null} />
//           <InfoRow label="Brancura" value={realtimeData?.brancura ?? null} />
//           <InfoRow label="Brancura Online" value={realtimeData?.brancuraOnline ?? null} />
//           <InfoRow label="Desvio Padrão" value={realtimeData?.desvioPadrao ?? null} />
//           <InfoRow label="Amostras" value={realtimeData?.qtdAmostras ?? null} />
//           <InfoRow label="Modo Operação" value={realtimeData?.modoOperacao ?? null} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }






// // components/whitekon-card.tsx

// "use client"

// import { useState, useEffect } from "react"
// import type { WhiteKon } from "@/lib/types"
// import { useWhitekon } from "@/contexts/whitekon-context"
// import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Wifi, WifiOff } from "lucide-react"

// interface WhiteKonCardProps {
//   device: WhiteKon;
// }

// interface RealtimeData {
//   tempCalibracao: string | null;
//   tempOnline: string | null;
//   blue: number | null;
//   brancura: string | null;
//   brancuraOnline: string | null;
//   desvioPadrao: string | null;
//   qtdAmostras: number | null;
//   modoOperacao: string | null;
// }

// export function WhiteKonCard({ device }: WhiteKonCardProps) {
//   const { isConnected, connectionParams, whitekonData } = useWhitekon();
//   const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);

//   const isThisDeviceConnected = isConnected && connectionParams?.address === String(device.rtuAddress);

//   // Função para atualizar os dados exibidos no card
//   const updateDisplayData = () => {
//     if (isThisDeviceConnected && whitekonData?.registers) {
//       const registers = whitekonData.registers;
      
//       // [FIX] Lógica ajustada para o registrador 29
//       const getModoOperacao = (code: number | null) => {
//         if (code === null) return "Indefinido";
//         switch (code) {
//           case 0: return "Automático";
//           case 1: return "Manual";
//           default: return "Desconhecido";
//         }
//       };

//       setRealtimeData({
//         // [FIX] Label abreviado para evitar quebra de linha
//         tempCalibracao: registers[6] !== null && registers[6] !== 65535 ? (registers[6] / 10).toFixed(1) + " °C" : "---",
//         tempOnline: registers[7] !== null ? (registers[7] / 10).toFixed(1) + " °C" : "---",
//         blue: registers[17] ?? null,
//         brancura: registers[5] !== null ? (registers[5] / 10).toFixed(1) + " %" : "---",
//         brancuraOnline: registers[21] !== null ? (registers[21] / 10).toFixed(1) + " %" : "---",
//         desvioPadrao: registers[11] !== null ? (registers[11] / 100).toFixed(2) + " %" : "---",
//         qtdAmostras: registers[19] ?? null,
//         // [FIX] Usando o registrador 29 para modo Automático/Manual
//         modoOperacao: getModoOperacao(registers[29]), 
//       });
//     } else if (realtimeData !== null) {
//       setRealtimeData(null);
//     }
//   };

//   // Efeito para atualização em tempo real
//   useEffect(() => {
//     let interval: NodeJS.Timeout | null = null;
//     if (isThisDeviceConnected) {
//       updateDisplayData();
//       interval = setInterval(updateDisplayData, 1000); // Atualiza a cada 1 segundo
//     }
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isThisDeviceConnected, whitekonData]);

//   const InfoRow = ({ label, value }: { label: string; value: string | number | null }) => (
//     <div className="flex justify-between items-center text-sm">
//       <p className="text-muted-foreground">{label}:</p>
//       <p className="font-mono font-medium">{value ?? "---"}</p>
//     </div>
//   );

//   return (
//     <>
//       <CardHeader>
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg">{device.name}</CardTitle>
//           <Badge variant={isThisDeviceConnected ? "default" : "secondary"}>
//             {isThisDeviceConnected ? <Wifi className="h-4 w-4 mr-2 animate-pulse" /> : <WifiOff className="h-4 w-4 mr-2" />}
//             {isThisDeviceConnected ? "Conectado" : "Desconectado"}
//           </Badge>
//         </div>
//         <p className="text-xs text-muted-foreground pt-1">
//           RTU: {device.rtuAddress} | Máquina: {device.machineName}
//         </p>
//       </CardHeader>
//       <CardContent className="space-y-4 flex-grow">
//         <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/20">
//           <InfoRow label="Temp. Calib." value={realtimeData?.tempCalibracao ?? null} />
//           <InfoRow label="Temp. Online" value={realtimeData?.tempOnline ?? null} />
//           <InfoRow label="Blue" value={realtimeData?.blue ?? null} />
//           <InfoRow label="Brancura" value={realtimeData?.brancura ?? null} />
//           <InfoRow label="Brancura Online" value={realtimeData?.brancuraOnline ?? null} />
//           <InfoRow label="Desvio Padrão" value={realtimeData?.desvioPadrao ?? null} />
//           <InfoRow label="Amostras" value={realtimeData?.qtdAmostras ?? null} />
//           <InfoRow label="Modo Operação" value={realtimeData?.modoOperacao ?? null} />
//         </div>
//       </CardContent>
//     </>
//   );
// }






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
  tempCalibracao: string | null;
  tempOnline: string | null;
  blue: number | null;
  brancura: string | null;
  brancuraOnline: string | null;
  desvioPadrao: string | null;
  qtdAmostras: number | null;
  modoOperacao: string | null;
}

export function WhiteKonCard({ device }: WhiteKonCardProps) {
  const { isConnected, connectionParams, whitekonData } = useWhitekon();
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);

  const isThisDeviceConnected = isConnected && connectionParams?.address === String(device.rtuAddress);

  // Função para atualizar os dados exibidos no card
  const updateDisplayData = () => {
    if (isThisDeviceConnected && whitekonData?.registers) {
      const registers = whitekonData.registers;
      
      // [FIX] Lógica ajustada para o registrador 29
      const getModoOperacao = (code: number | null) => {
        if (code === null) return "Indefinido";
        switch (code) {
          case 0: return "Automático";
          case 1: return "Manual";
          default: return "Desconhecido";
        }
      };

      setRealtimeData({
        // [FIX] Label abreviado para evitar quebra de linha
        tempCalibracao: registers[6] !== null && registers[6] !== 65535 ? (registers[6] / 10).toFixed(1) + " °C" : "---",
        tempOnline: registers[7] !== null ? (registers[7] / 10).toFixed(1) + " °C" : "---",
        blue: registers[17] ?? null,
        brancura: registers[5] !== null ? (registers[5] / 10).toFixed(1) + " %" : "---",
        brancuraOnline: registers[21] !== null ? (registers[21] / 10).toFixed(1) + " %" : "---",
        desvioPadrao: registers[11] !== null ? (registers[11] / 100).toFixed(2) + " %" : "---",
        qtdAmostras: registers[19] ?? null,
        // [FIX] Usando o registrador 29 para modo Automático/Manual
        modoOperacao: getModoOperacao(registers[29]), 
      });
    } else if (realtimeData !== null) {
      setRealtimeData(null);
    }
  };

  // Efeito para atualização em tempo real
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isThisDeviceConnected) {
      updateDisplayData();
      interval = setInterval(updateDisplayData, 1000); // Atualiza a cada 1 segundo
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isThisDeviceConnected, whitekonData]);

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
          <Badge variant={isThisDeviceConnected ? "default" : "secondary"}>
            {isThisDeviceConnected ? <Wifi className="h-4 w-4 mr-2 animate-pulse" /> : <WifiOff className="h-4 w-4 mr-2" />}
            {isThisDeviceConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          RTU: {device.rtuAddress} | Máquina: {device.machineName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/20">
          <InfoRow label="Temp. Calib." value={realtimeData?.tempCalibracao ?? null} />
          <InfoRow label="Temp. Online" value={realtimeData?.tempOnline ?? null} />
          <InfoRow label="Blue" value={realtimeData?.blue ?? null} />
          <InfoRow label="Brancura" value={realtimeData?.brancura ?? null} />
          <InfoRow label="Brancura Online" value={realtimeData?.brancuraOnline ?? null} />
          <InfoRow label="Desvio Padrão" value={realtimeData?.desvioPadrao ?? null} />
          <InfoRow label="Amostras" value={realtimeData?.qtdAmostras ?? null} />
          <InfoRow label="Modo Operação" value={realtimeData?.modoOperacao ?? null} />
        </div>
      </CardContent>
    </>
  );
}