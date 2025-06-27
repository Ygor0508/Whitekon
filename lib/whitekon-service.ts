// import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

// export interface WhitekonData {
//   registers: { [key: number]: number | null }
//   // Dados decodificados da nova API
//   brancura?: {
//     media: number | null
//     online: number | null
//     desvio_padrao: number | null
//   }
//   temperatura?: {
//     calibracao: number | null
//     online: number | null
//   }
//   rgb?: {
//     red: number | null
//     green: number | null
//     blue: number | null
//     clear: number | null
//   }
//   blue_calibracao?: {
//     preto: number | null
//     branco: number | null
//   }
//   amostras?: number | null
//   alarmes?: number | null
// }

// export class WhitekonService {
//   private static instance: WhitekonService
//   private connected = false
//   private pollingInterval: NodeJS.Timeout | null = null
//   private statusCheckInterval: NodeJS.Timeout | null = null
//   private data: WhitekonData | null = null
//   private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = []
//   private currentPort = ""
//   private currentBaudRate = 115200
//   private currentAddress = 4
//   private isBusy = false // Flag para evitar operações simultâneas
//   private lastStatusCheck = 0 // Throttling para status check

//   private constructor() {}

//   public static getInstance(): WhitekonService {
//     if (!WhitekonService.instance) {
//       WhitekonService.instance = new WhitekonService()
//     }
//     return WhitekonService.instance
//   }

//   public async connect(
//     portName: string,
//     baudRateStr: string,
//     addressStr: string,
//     signal?: AbortSignal,
//   ): Promise<boolean> {
//     try {
//       const baudRate = Number.parseInt(baudRateStr, 10)
//       const address = Number.parseInt(addressStr, 10)

//       this.currentPort = portName
//       this.currentBaudRate = baudRate
//       this.currentAddress = address

//       const url = `/api/whitekon?action=connect&port=${encodeURIComponent(portName)}&baudrate=${baudRate}&unit=${address}`

//       const response = await fetch(url, { signal })

//       if (!response.ok) {
//         const errorData = await response.json()
//         console.error("Erro na resposta da API:", errorData)
//         throw new Error(errorData.error || `Erro na resposta da API: ${response.status}`)
//       }

//       const data = await response.json()
//       this.connected = data.status === "connected"

//       if (this.connected) {
//         this.data = { registers: {} }
//         this.startPolling()
//         this.startStatusCheck()
//       } else {
//         this.data = null
//         this.notifyDataUpdate()
//       }

//       return this.connected
//     } catch (error) {
//       console.error("Erro ao conectar:", error)
//       this.connected = false
//       this.data = null
//       this.notifyDataUpdate()
//       throw error
//     }
//   }

//   public async disconnect(): Promise<boolean> {
//     try {
//       this.stopPolling()
//       this.stopStatusCheck()

//       const response = await fetch("/api/whitekon?action=disconnect")
//       const data = await response.json()
//       this.connected = !(data.status === "disconnected")

//       this.data = null
//       this.notifyDataUpdate()

//       return !this.connected
//     } catch (error) {
//       console.error("Erro ao desconectar:", error)
//       return false
//     }
//   }

//   public isConnected(): boolean {
//     return this.connected
//   }

//   public async checkConnectionStatus(): Promise<boolean> {
//     const now = Date.now()
//     if (now - this.lastStatusCheck < 15000) {
//       return this.connected
//     }
//     this.lastStatusCheck = now

//     if (this.isBusy) {
//       return this.connected
//     }

//     try {
//       const response = await fetch("/api/whitekon?action=status")
//       const data = await response.json()
//       const wasConnected = this.connected
//       this.connected = data.connected
//       if (wasConnected && !this.connected) {
//         this.data = null
//         this.notifyDataUpdate()
//       }
//       return this.connected
//     } catch (error) {
//       return this.connected
//     }
//   }

//   public async readRegister(address: number): Promise<number | null> {
//     if (!this.connected) throw new Error("Não conectado")
//     if (this.isBusy) {
//       console.warn(`Tentativa de leitura no registro ${address} ignorada: comunicação em andamento.`)
//       return null
//     }

//     this.isBusy = true
//     try {
//       const response = await fetch(`/api/whitekon?action=read&register=${address}`)
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Erro ao ler registro ${address}`)
//       }
//       const data = await response.json()
//       if (data.error) throw new Error(data.error)
//       if (this.data?.registers) {
//         this.data.registers[address] = data.value
//         this.notifyDataUpdate()
//       }
//       return data.value
//     } catch (error) {
//       console.error(`Erro ao ler registro ${address}:`, error)
//       throw error
//     } finally {
//       this.isBusy = false
//     }
//   }

//   public async readRegisters(startAddress: number, count: number): Promise<number[]> {
//     if (!this.connected) throw new Error("Não conectado")
//     if (this.isBusy) {
//       console.warn(`Tentativa de leitura de ${count} registros a partir de ${startAddress} ignorada.`)
//       return []
//     }

//     this.isBusy = true
//     try {
//       const response = await fetch(`/api/whitekon?action=read&register=${startAddress}&count=${count}`)
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Erro ao ler múltiplos registros")
//       }
//       const data = await response.json()
//       if (data.error) throw new Error(data.error)
//       if (this.data?.registers && data.values) {
//         data.values.forEach((value: number, index: number) => {
//           this.data!.registers[startAddress + index] = value
//         })
//         this.notifyDataUpdate()
//       }
//       return data.values || []
//     } catch (error) {
//       console.error(`Erro ao ler múltiplos registros:`, error)
//       throw error
//     } finally {
//       this.isBusy = false
//     }
//   }
  
//   public async readAllRegisters(): Promise<{ [key: number]: number | null }> {
//     if (!this.connected) throw new Error("Não conectado");
//     if (this.isBusy) {
//       console.warn("Leitura de todos os registros ignorada: comunicação em andamento.");
//       return this.data?.registers || {};
//     }
  
//     this.isBusy = true;
//     try {
//       const response = await fetch("/api/whitekon?action=read-all");
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Erro ao ler todos os registros");
//       }
//       const data = await response.json();
//       if (data.error) throw new Error(data.error);
  
//       if (this.data) {
//         this.data.registers = { ...this.data.registers, ...data.registers };
//         this.notifyDataUpdate();
//       }
//       return data.registers;
//     } catch (error) {
//       console.error("Erro ao ler todos os registros:", error);
//       throw error;
//     } finally {
//       this.isBusy = false;
//     }
//   }

//   public async writeRegister(address: number, value: number): Promise<boolean> {
//     if (!this.connected) throw new Error("Não conectado")
//     if (this.isBusy) {
//       console.warn(`Tentativa de escrita no registro ${address} ignorada: comunicação em andamento.`)
//       return false
//     }

//     this.isBusy = true
//     try {
//       const response = await fetch("/api/whitekon", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ register: address, value }),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Erro ao escrever no registro ${address}`)
//       }
//       const result = await response.json()
//       if (result.success && this.data?.registers) {
//         this.data.registers[address] = value
//         this.notifyDataUpdate()
//       }
//       return result.success === true
//     } catch (error) {
//       console.error(`Erro ao escrever no registro ${address}:`, error)
//       throw error
//     } finally {
//       this.isBusy = false
//     }
//   }

//   private startPolling(interval = 1000): void {
//     if (this.pollingInterval) clearInterval(this.pollingInterval)
//     this.pollingInterval = setInterval(async () => {
//       if (this.connected && !this.isBusy) {
//           await this.readAllRegisters();
//       }
//     }, interval)
//   }

//   private stopPolling(): void {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval)
//       this.pollingInterval = null
//     }
//   }

//   private startStatusCheck(): void {
//     if (this.statusCheckInterval) clearInterval(this.statusCheckInterval)
//     this.statusCheckInterval = setInterval(async () => {
//       await this.checkConnectionStatus()
//     }, 60000)
//   }

//   private stopStatusCheck(): void {
//     if (this.statusCheckInterval) {
//       clearInterval(this.statusCheckInterval)
//       this.statusCheckInterval = null
//     }
//   }

//   private notifyDataUpdate(): void {
//     this.onDataUpdateCallbacks.forEach((callback) => callback(this.data))
//   }

//   public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
//     this.onDataUpdateCallbacks.push(callback)
//     return () => {
//       this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback)
//     }
//   }

//   public getData(): WhitekonData | null {
//     return this.data
//   }

//   // Métodos de atalho
//   public async setOperationMode(mode: number): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode)
//   }
//   public async calibrateDark(): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO)
//   }
//   public async calibrateWhite(): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO)
//   }
//   public async setAutoMode(auto: boolean): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL)
//   }

//   // Métodos adicionados para corrigir os erros
//   public async setIntegrationTime(timeCode: number): Promise<boolean> {
//     const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
//     if (currentValue === null) return false
//     const gain = currentValue & 0xff
//     const newValue = (timeCode << 8) | gain
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
//   }

//   public async setGain(gainCode: number): Promise<boolean> {
//     const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
//     if (currentValue === null) return false
//     const time = currentValue & 0xff00
//     const newValue = time | gainCode
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
//   }

//   public async setOffset(offsetValue: number): Promise<boolean> {
//     // A lógica no componente multiplica por 10, então assumimos o valor já ajustado
//     return this.writeRegister(WhitekonRegisters.OFFSET, offsetValue)
//   }

//   public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
//     const minSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, min)
//     if (!minSuccess) return false
//     const maxSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, max)
//     return maxSuccess
//   }
// }






// import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

// export interface WhitekonData {
//   registers: { [key: number]: number | null }
//   brancura?: {
//     media: number | null
//     online: number | null
//     desvio_padrao: number | null
//   }
//   temperatura?: {
//     calibracao: number | null
//     online: number | null
//   }
//   rgb?: {
//     red: number | null
//     green: number | null
//     blue: number | null
//     clear: number | null
//   }
//   blue_calibracao?: {
//     preto: number | null
//     branco: number | null
//   }
//   amostras?: number | null
//   alarmes?: number | null
// }

// export class WhitekonService {
//   private static instance: WhitekonService
//   private connected = false
//   private pollingInterval: NodeJS.Timeout | null = null
//   private statusCheckInterval: NodeJS.Timeout | null = null
//   private data: WhitekonData | null = null
//   private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = []
//   private currentPort = ""
//   private currentBaudRate = 115200
//   private currentAddress = 4
//   private isBusy = false
//   private lastStatusCheck = 0

//   private constructor() {}

//   public static getInstance(): WhitekonService {
//     if (!WhitekonService.instance) {
//       WhitekonService.instance = new WhitekonService()
//     }
//     return WhitekonService.instance
//   }

//   public async connect(
//     portName: string,
//     baudRateStr: string,
//     addressStr: string,
//     signal?: AbortSignal,
//   ): Promise<boolean> {
//     try {
//       const baudRate = Number.parseInt(baudRateStr, 10)
//       const address = Number.parseInt(addressStr, 10)

//       this.currentPort = portName
//       this.currentBaudRate = baudRate
//       this.currentAddress = address

//       const url = `/api/whitekon?action=connect&port=${encodeURIComponent(portName)}&baudrate=${baudRate}&unit=${address}`

//       const response = await fetch(url, { signal })

//       if (!response.ok) {
//         const errorData = await response.json()
//         console.error("Erro na resposta da API:", errorData)
//         throw new Error(errorData.error || `Erro na resposta da API: ${response.status}`)
//       }

//       const data = await response.json()
//       this.connected = data.status === "connected"

//       if (this.connected) {
//         this.data = { registers: {} }
//         this.startPolling()
//         this.startStatusCheck()
        
//         // NOVA: Salva estado da conexão para persistência
//         localStorage.setItem("whitekon-connection-status", "connected")
//       } else {
//         this.data = null
//         localStorage.removeItem("whitekon-connection-status")
//         this.notifyDataUpdate()
//       }

//       return this.connected
//     } catch (error) {
//       console.error("Erro ao conectar:", error)
//       this.connected = false
//       this.data = null
//       localStorage.removeItem("whitekon-connection-status")
//       this.notifyDataUpdate()
//       throw error
//     }
//   }

//   public async disconnect(): Promise<boolean> {
//     try {
//       this.stopPolling()
//       this.stopStatusCheck()

//       const response = await fetch("/api/whitekon?action=disconnect")
//       const data = await response.json()
//       this.connected = !(data.status === "disconnected")

//       this.data = null
//       localStorage.removeItem("whitekon-connection-status")
//       this.notifyDataUpdate()

//       return !this.connected
//     } catch (error) {
//       console.error("Erro ao desconectar:", error)
//       return false
//     }
//   }

//   public isConnected(): boolean {
//     return this.connected
//   }

//   // NOVA: Método para verificar e restaurar conexão se necessário
//   public async checkAndRestoreConnection(): Promise<boolean> {
//     try {
//       const response = await fetch("/api/whitekon?action=status")
//       const data = await response.json()
      
//       if (data.connected && !this.connected) {
//         // A API ainda tem conexão, mas o serviço não sabe
//         this.connected = true
//         this.data = { registers: {} }
//         this.startPolling()
//         this.startStatusCheck()
//         console.log("Conexão restaurada automaticamente")
//         return true
//       } else if (!data.connected && this.connected) {
//         // A API perdeu a conexão
//         this.connected = false
//         this.data = null
//         this.stopPolling()
//         this.stopStatusCheck()
//         localStorage.removeItem("whitekon-connection-status")
//         this.notifyDataUpdate()
//         return false
//       }
      
//       return this.connected
//     } catch (error) {
//       console.error("Erro ao verificar conexão:", error)
//       return this.connected
//     }
//   }

//   public async checkConnectionStatus(): Promise<boolean> {
//     const now = Date.now()
//     if (now - this.lastStatusCheck < 15000) {
//       return this.connected
//     }
//     this.lastStatusCheck = now

//     if (this.isBusy) {
//       return this.connected
//     }

//     try {
//       const response = await fetch("/api/whitekon?action=status")
//       const data = await response.json()
//       const wasConnected = this.connected
//       this.connected = data.connected
      
//       if (wasConnected && !this.connected) {
//         this.data = null
//         localStorage.removeItem("whitekon-connection-status")
//         this.notifyDataUpdate()
//       } else if (this.connected && !wasConnected) {
//         localStorage.setItem("whitekon-connection-status", "connected")
//       }
      
//       return this.connected
//     } catch (error) {
//       return this.connected
//     }
//   }

//   // SUBSTITUA o método readRegister inteiro por este:
// public async readRegister(address: number): Promise<number | null> {
//   if (!this.connected) throw new Error("Não conectado")
//   if (this.isBusy) {
//     console.warn(`Tentativa de leitura no registro ${address} ignorada: comunicação em andamento.`)
//     return null
//   }

//   this.isBusy = true
//   try {
//     const response = await fetch(`/api/whitekon?action=read®ister=${address}`)
//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.error || `Erro ao ler registro ${address}`)
//     }
//     const data = await response.json()
//     if (data.error) throw new Error(data.error)
//     if (this.data?.registers) {
//       this.data.registers[address] = data.value
//       this.notifyDataUpdate()
//     }
//     return data.value
//   } catch (error) {
//     console.error(`Erro ao ler registro ${address}:`, error)
//     throw error
//   } finally {
//     this.isBusy = false
//   }
// }


//   // public async readRegister(address: number): Promise<number | null> {
//   //   if (!this.connected) throw new Error("Não conectado")
//   //   if (this.isBusy) {
//   //     console.warn(`Tentativa de leitura no registro ${address} ignorada: comunicação em andamento.`)
//   //     return null
//   //   }

//   //   this.isBusy = true
//   //   try {
//   //     const response = await fetch(`/api/whitekon?action=read®ister=${address}`)
//   //     if (!response.ok) {
//   //       const errorData = await response.json()
//   //       throw new Error(errorData.error || `Erro ao ler registro ${address}`)
//   //     }
//   //     const data = await response.json()
//   //     if (data.error) throw new Error(data.error)
//   //     if (this.data?.registers) {
//   //       this.data.registers[address] = data.value
//   //       this.notifyDataUpdate()
//   //     }
//   //     return data.value
//   //   } catch (error) {
//   //     console.error(`Erro ao ler registro ${address}:`, error)
//   //     throw error
//   //   } finally {
//   //     this.isBusy = false
//   //   }
//   // }

//   public async readRegisters(startAddress: number, count: number): Promise<number[]> {
//     if (!this.connected) throw new Error("Não conectado")
//     if (this.isBusy) {
//       console.warn(`Tentativa de leitura de ${count} registros a partir de ${startAddress} ignorada.`)
//       return []
//     }

//     this.isBusy = true
//     try {
//       const response = await fetch(`/api/whitekon?action=read®ister=${startAddress}&count=${count}`)
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Erro ao ler múltiplos registros")
//       }
//       const data = await response.json()
//       if (data.error) throw new Error(data.error)
//       if (this.data?.registers && data.values) {
//         data.values.forEach((value: number, index: number) => {
//           this.data!.registers[startAddress + index] = value
//         })
//         this.notifyDataUpdate()
//       }
//       return data.values || []
//     } catch (error) {
//       console.error(`Erro ao ler múltiplos registros:`, error)
//       throw error
//     } finally {
//       this.isBusy = false
//     }
//   }
  
//   public async readAllRegisters(): Promise<{ [key: number]: number | null }> {
//     if (!this.connected) throw new Error("Não conectado");
//     if (this.isBusy) {
//       console.warn("Leitura de todos os registros ignorada: comunicação em andamento.");
//       return this.data?.registers || {};
//     }
  
//     this.isBusy = true;
//     try {
//       const response = await fetch("/api/whitekon?action=read-all");
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Erro ao ler todos os registros");
//       }
//       const data = await response.json();
//       if (data.error) throw new Error(data.error);
  
//       if (this.data) {
//         this.data.registers = { ...this.data.registers, ...data.registers };
//         this.notifyDataUpdate();
//       }
//       return data.registers;
//     } catch (error) {
//       console.error("Erro ao ler todos os registros:", error);
//       throw error;
//     } finally {
//       this.isBusy = false;
//     }
//   }

//   public async writeRegister(address: number, value: number): Promise<boolean> {
//     if (!this.connected) throw new Error("Não conectado")
//     if (this.isBusy) {
//       console.warn(`Tentativa de escrita no registro ${address} ignorada: comunicação em andamento.`)
//       return false
//     }

//     this.isBusy = true
//     try {
//       const response = await fetch("/api/whitekon", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ register: address, value }),
//       })
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Erro ao escrever no registro ${address}`)
//       }
//       const result = await response.json()
//       if (result.success && this.data?.registers) {
//         this.data.registers[address] = value
//         this.notifyDataUpdate()
//       }
//       return result.success === true
//     } catch (error) {
//       console.error(`Erro ao escrever no registro ${address}:`, error)
//       throw error
//     } finally {
//       this.isBusy = false
//     }
//   }

//   private startPolling(interval = 1000): void {
//     if (this.pollingInterval) clearInterval(this.pollingInterval)
//     this.pollingInterval = setInterval(async () => {
//       if (this.connected && !this.isBusy) {
//           await this.readAllRegisters();
//       }
//     }, interval)
//   }

//   private stopPolling(): void {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval)
//       this.pollingInterval = null
//     }
//   }

//   private startStatusCheck(): void {
//     if (this.statusCheckInterval) clearInterval(this.statusCheckInterval)
//     this.statusCheckInterval = setInterval(async () => {
//       await this.checkConnectionStatus()
//     }, 60000)
//   }

//   private stopStatusCheck(): void {
//     if (this.statusCheckInterval) {
//       clearInterval(this.statusCheckInterval)
//       this.statusCheckInterval = null
//     }
//   }

//   private notifyDataUpdate(): void {
//     this.onDataUpdateCallbacks.forEach((callback) => callback(this.data))
//   }

//   public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
//     this.onDataUpdateCallbacks.push(callback)
//     return () => {
//       this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback)
//     }
//   }

//   public getData(): WhitekonData | null {
//     return this.data
//   }

//   // Métodos de atalho
//   public async setOperationMode(mode: number): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode)
//   }
//   public async calibrateDark(): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO)
//   }
//   public async calibrateWhite(): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO)
//   }
//   public async setAutoMode(auto: boolean): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL)
//   }

//   public async setIntegrationTime(timeCode: number): Promise<boolean> {
//     const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
//     if (currentValue === null) return false
//     const gain = currentValue & 0xff
//     const newValue = (timeCode << 8) | gain
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
//   }

//   public async setGain(gainCode: number): Promise<boolean> {
//     const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
//     if (currentValue === null) return false
//     const time = currentValue & 0xff00
//     const newValue = time | gainCode
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
//   }

//   public async setOffset(offsetValue: number): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.OFFSET, offsetValue)
//   }

//   public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
//     const minSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, min)
//     if (!minSuccess) return false
//     const maxSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, max)
//     return maxSuccess
//   }
// }







// import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

// export interface WhitekonData {
//   registers: { [key: number]: number | null }
//   brancura?: {
//     media: number | null
//     online: number | null
//     desvio_padrao: number | null
//   }
//   temperatura?: {
//     calibracao: number | null
//     online: number | null
//   }
//   rgb?: {
//     red: number | null
//     green: number | null
//     blue: number | null
//     clear: number | null
//   }
//   blue_calibracao?: {
//     preto: number | null
//     branco: number | null
//   }
//   amostras?: number | null
//   alarmes?: number | null
// }

// export class WhitekonService {
//   private static instance: WhitekonService
//   private connected = false
//   private pollingInterval: NodeJS.Timeout | null = null
//   private statusCheckInterval: NodeJS.Timeout | null = null
//   private data: WhitekonData | null = null
//   private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = []
//   private currentPort = ""
//   private currentBaudRate = 115200
//   private currentAddress = 4
//   private isBusy = false
//   private lastStatusCheck = 0

//   private constructor() {}

//   public static getInstance(): WhitekonService {
//     if (!WhitekonService.instance) {
//       WhitekonService.instance = new WhitekonService()
//     }
//     return WhitekonService.instance
//   }

//   public async connect(
//   portName: string,
//   baudRateStr: string,
//   addressStr: string,
//   signal?: AbortSignal,
// ): Promise<boolean> {
//   try {
//     const baudRate = Number.parseInt(baudRateStr, 10)
//     const address = Number.parseInt(addressStr, 10)

//     this.currentPort = portName
//     this.currentBaudRate = baudRate
//     this.currentAddress = address

//     // CORREÇÃO: URL construída de forma mais segura
//     const url = new URL('/api/whitekon', window.location.origin)
//     url.searchParams.set('action', 'connect')
//     url.searchParams.set('port', portName)
//     url.searchParams.set('baudrate', baudRate.toString())
//     url.searchParams.set('unit', address.toString())

//     console.log("🔗 Conectando:", { portName, baudRate, address })
//     console.log("🔗 URL:", url.toString())
    
//     const response = await fetch(url.toString(), { signal })

//     if (!response.ok) {
//       const errorData = await response.json()
//       console.error("Erro na resposta da API:", errorData)
//       throw new Error(errorData.error || `Erro na resposta da API: ${response.status}`)
//     }

//     const data = await response.json()
//     this.connected = data.status === "connected"

//     if (this.connected) {
//       this.data = { registers: {} }
//       this.startPolling()
//       this.startStatusCheck()
      
//       // Salva estado da conexão para persistência
//       localStorage.setItem("whitekon-connection-status", "connected")
//       console.log("✅ Conectado com sucesso!")
//     } else {
//       this.data = null
//       localStorage.removeItem("whitekon-connection-status")
//       this.notifyDataUpdate()
//     }

//     return this.connected
//   } catch (error) {
//     console.error("❌ Erro ao conectar:", error)
//     this.connected = false
//     this.data = null
//     localStorage.removeItem("whitekon-connection-status")
//     this.notifyDataUpdate()
//     throw error
//   }
// }


//   public async disconnect(): Promise<boolean> {
//     try {
//       console.log("🔌 Desconectando...")
//       this.stopPolling()
//       this.stopStatusCheck()

//       const response = await fetch("/api/whitekon?action=disconnect")
//       const data = await response.json()
//       this.connected = !(data.status === "disconnected")

//       this.data = null
//       localStorage.removeItem("whitekon-connection-status")
//       this.notifyDataUpdate()

//       console.log("✅ Desconectado com sucesso")
//       return !this.connected
//     } catch (error) {
//       console.error("❌ Erro ao desconectar:", error)
//       return false
//     }
//   }

//   public isConnected(): boolean {
//     return this.connected
//   }

//   public async checkAndRestoreConnection(): Promise<boolean> {
//     try {
//       console.log("🔍 Verificando conexão existente...")
//       const response = await fetch("/api/whitekon?action=status")
//       const data = await response.json()
      
//       if (data.connected && !this.connected) {
//         this.connected = true
//         this.data = { registers: {} }
//         this.startPolling()
//         this.startStatusCheck()
//         console.log("🔄 Conexão restaurada automaticamente")
//         return true
//       } else if (!data.connected && this.connected) {
//         this.connected = false
//         this.data = null
//         this.stopPolling()
//         this.stopStatusCheck()
//         localStorage.removeItem("whitekon-connection-status")
//         this.notifyDataUpdate()
//         return false
//       }
      
//       return this.connected
//     } catch (error) {
//       console.error("❌ Erro ao verificar conexão:", error)
//       return this.connected
//     }
//   }

//   public async checkConnectionStatus(): Promise<boolean> {
//     const now = Date.now()
//     if (now - this.lastStatusCheck < 15000) {
//       return this.connected
//     }
//     this.lastStatusCheck = now

//     try {
//       const response = await fetch("/api/whitekon?action=status")
//       const data = await response.json()
//       const wasConnected = this.connected
//       this.connected = data.connected
      
//       if (wasConnected && !this.connected) {
//         console.warn("⚠️ Perda de conexão detectada")
//         this.data = null
//         localStorage.removeItem("whitekon-connection-status")
//         this.notifyDataUpdate()
//       } else if (this.connected && !wasConnected) {
//         localStorage.setItem("whitekon-connection-status", "connected")
//       }
      
//       return this.connected
//     } catch (error) {
//       console.error("❌ Erro ao verificar status:", error)
//       return this.connected
//     }
//   }

//   public async readRegister(address: number): Promise<number | null> {
//   if (!this.connected) throw new Error("Não conectado")
  
//   // Pausa temporariamente o polling para evitar conflitos
//   const wasPolling = !!this.pollingInterval
//   if (wasPolling) {
//     this.stopPolling()
//   }

//   try {
//     // CORREÇÃO: URL construída de forma mais segura
//     const url = new URL('/api/whitekon', window.location.origin)
//     url.searchParams.set('action', 'read')
//     url.searchParams.set('register', address.toString())
    
//     console.log(`📖 Lendo registro ${address} - URL: ${url.toString()}`)
    
//     const response = await fetch(url.toString())
//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.error || `Erro ao ler registro ${address}`)
//     }
//     const data = await response.json()
//     if (data.error) throw new Error(data.error)
    
//     if (this.data?.registers) {
//       this.data.registers[address] = data.value
//       this.notifyDataUpdate()
//     }
    
//     console.log(`✅ Registro ${address} = ${data.value}`)
//     return data.value
//   } catch (error) {
//     console.error(`❌ Erro ao ler registro ${address}:`, error)
//     throw error
//   } finally {
//     // Retoma o polling se estava ativo
//     if (wasPolling) {
//       setTimeout(() => this.startPolling(), 300)
//     }
//   }
// }


//   public async readRegisters(startAddress: number, count: number): Promise<number[]> {
//   if (!this.connected) throw new Error("Não conectado")
  
//   const wasPolling = !!this.pollingInterval
//   if (wasPolling) {
//     this.stopPolling()
//   }

//   try {
//     // CORREÇÃO: URL construída de forma mais segura
//     const url = new URL('/api/whitekon', window.location.origin)
//     url.searchParams.set('action', 'read')
//     url.searchParams.set('register', startAddress.toString())
//     url.searchParams.set('count', count.toString())
    
//     console.log(`📖 Lendo ${count} registros a partir de ${startAddress} - URL: ${url.toString()}`)
    
//     const response = await fetch(url.toString())
//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.error || "Erro ao ler múltiplos registros")
//     }
//     const data = await response.json()
//     if (data.error) throw new Error(data.error)
    
//     if (this.data?.registers && data.values) {
//       data.values.forEach((value: number, index: number) => {
//         this.data!.registers[startAddress + index] = value
//       })
//       this.notifyDataUpdate()
//     }
//     return data.values || []
//   } catch (error) {
//     console.error(`❌ Erro ao ler múltiplos registros:`, error)
//     throw error
//   } finally {
//     if (wasPolling) {
//       setTimeout(() => this.startPolling(), 300)
//     }
//   }
// }


//   public async readAllRegisters(): Promise<{ [key: number]: number | null }> {
//   if (!this.connected) throw new Error("Não conectado")
//   if (this.isBusy) {
//     // Se estiver ocupado, retorna os dados já existentes
//     return this.data?.registers || {}
//   }

//   this.isBusy = true
//   try {
//     // CORREÇÃO: URL construída de forma mais segura
//     const url = new URL('/api/whitekon', window.location.origin)
//     url.searchParams.set('action', 'read-all')
    
//     const response = await fetch(url.toString())
//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.error || "Erro ao ler todos os registros")
//     }
//     const data = await response.json()
//     if (data.error) throw new Error(data.error)

//     if (this.data) {
//       this.data.registers = { ...this.data.registers, ...data.registers }
//       this.notifyDataUpdate()
//     }
//     return data.registers
//   } catch (error) {
//     console.error("❌ Erro ao ler todos os registros:", error)
//     // Não joga erro para não parar o polling
//     return this.data?.registers || {}
//   } finally {
//     this.isBusy = false
//   }
// }


//   public async writeRegister(address: number, value: number): Promise<boolean> {
//     if (!this.connected) {
//       console.error("❌ Tentativa de escrita sem conexão")
//       throw new Error("Não conectado")
//     }

//     console.log(`🔧 Escrevendo registro ${address} = ${value}`)
    
//     // Pausa temporariamente o polling para evitar conflitos
//     const wasPolling = !!this.pollingInterval
//     if (wasPolling) {
//       console.log("⏸️ Pausando polling para escrita")
//       this.stopPolling()
//     }

//     try {
//       const response = await fetch("/api/whitekon", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           action: "write",
//           register: address, 
//           value: value 
//         }),
//       })

//       console.log(`📡 Resposta da API para escrita: ${response.status}`)

//       if (!response.ok) {
//         const errorData = await response.json()
//         console.error("❌ Erro na resposta da escrita:", errorData)
//         throw new Error(errorData.error || `Erro ao escrever no registro ${address}`)
//       }

//       const result = await response.json()
//       console.log(`📋 Resultado da escrita:`, result)

//       if (result.success) {
//         // Atualiza o registro local
//         if (this.data?.registers) {
//           this.data.registers[address] = value
//           this.notifyDataUpdate()
//         }
//         console.log(`✅ Registro ${address} = ${value} escrito com sucesso`)
//         return true
//       } else {
//         console.error(`❌ Falha na escrita do registro ${address}:`, result)
//         return false
//       }
//     } catch (error) {
//       console.error(`❌ Erro ao escrever no registro ${address}:`, error)
//       throw error
//     } finally {
//       // Retoma o polling após um pequeno delay
//       if (wasPolling) {
//         setTimeout(() => {
//           console.log("▶️ Retomando polling após escrita")
//           this.startPolling()
//         }, 500)
//       }
//     }
//   }

//   private startPolling(interval = 2000): void {
//     if (this.pollingInterval) clearInterval(this.pollingInterval)
//     this.pollingInterval = setInterval(async () => {
//       if (this.connected && !this.isBusy) {
//         try {
//           await this.readAllRegisters()
//         } catch (error) {
//           console.error("❌ Erro durante polling:", error)
//         }
//       }
//     }, interval)
//   }

//   private stopPolling(): void {
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval)
//       this.pollingInterval = null
//     }
//   }

//   private startStatusCheck(): void {
//     if (this.statusCheckInterval) clearInterval(this.statusCheckInterval)
//     this.statusCheckInterval = setInterval(async () => {
//       await this.checkConnectionStatus()
//     }, 60000)
//   }

//   private stopStatusCheck(): void {
//     if (this.statusCheckInterval) {
//       clearInterval(this.statusCheckInterval)
//       this.statusCheckInterval = null
//     }
//   }

//   private notifyDataUpdate(): void {
//     this.onDataUpdateCallbacks.forEach((callback) => callback(this.data))
//   }

//   public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
//     this.onDataUpdateCallbacks.push(callback)
//     return () => {
//       this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback)
//     }
//   }

//   public getData(): WhitekonData | null {
//     return this.data
//   }

//   // ========================
//   // MÉTODOS DE CONTROLE
//   // ========================

//   public async setOperationMode(mode: number): Promise<boolean> {
//     console.log(`🔧 Definindo modo de operação: ${mode}`)
//     return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode)
//   }

//   public async calibrateDark(): Promise<boolean> {
//     console.log(`🔧 Iniciando calibração escuro`)
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO)
//   }

//   public async calibrateWhite(): Promise<boolean> {
//     console.log(`🔧 Iniciando calibração claro`)
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO)
//   }

//   public async setAutoMode(auto: boolean): Promise<boolean> {
//     console.log(`🔧 Definindo modo automático: ${auto}`)
//     return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL)
//   }

//   // ========================
//   // CONTROLE DE LED E BOBINA
//   // ========================

//   public async setLed(on: boolean): Promise<boolean> {
//     console.log(`🔧 ${on ? 'Ligando' : 'Desligando'} LED`)
    
//     try {
//       // Lê o valor atual do registro de controle remoto
//       const currentValue = await this.readRegister(WhitekonRegisters.CONTROLE_REMOTO) || 0
      
//       // Manipula o bit 0 (LED)
//       let newValue: number
//       if (on) {
//         newValue = currentValue | 0x01  // Liga o bit 0 (LED)
//       } else {
//         newValue = currentValue & 0xFE  // Desliga o bit 0 (LED)
//       }
      
//       console.log(`💡 LED: valor atual=${currentValue}, novo valor=${newValue}`)
//       return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue)
//     } catch (error) {
//       console.error("❌ Erro ao controlar LED:", error)
//       return false
//     }
//   }

//   public async setBobina(on: boolean): Promise<boolean> {
//     console.log(`🔧 ${on ? 'Acionando' : 'Desacionando'} bobina`)
    
//     try {
//       // Lê o valor atual do registro de controle remoto
//       const currentValue = await this.readRegister(WhitekonRegisters.CONTROLE_REMOTO) || 0
      
//       // Manipula o bit 1 (BOBINA)
//       let newValue: number
//       if (on) {
//         newValue = currentValue | 0x02  // Liga o bit 1 (BOBINA)
//       } else {
//         newValue = currentValue & 0xFD  // Desliga o bit 1 (BOBINA)
//       }
      
//       console.log(`🔌 BOBINA: valor atual=${currentValue}, novo valor=${newValue}`)
//       return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue)
//     } catch (error) {
//       console.error("❌ Erro ao controlar bobina:", error)
//       return false
//     }
//   }

//   public async setControleRemoto(led: boolean, bobina: boolean): Promise<boolean> {
//     console.log(`🔧 Controle remoto - LED: ${led}, BOBINA: ${bobina}`)
    
//     let value = 0
//     if (led) value |= 0x01     // bit 0 = LED
//     if (bobina) value |= 0x02  // bit 1 = BOBINA
    
//     return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, value)
//   }

//   public async getControleRemotoStatus(): Promise<{led: boolean, bobina: boolean} | null> {
//     try {
//       const value = await this.readRegister(WhitekonRegisters.CONTROLE_REMOTO)
//       if (value === null) return null
      
//       return {
//         led: (value & 0x01) !== 0,      // bit 0
//         bobina: (value & 0x02) !== 0    // bit 1
//       }
//     } catch (error) {
//       console.error("❌ Erro ao ler status do controle remoto:", error)
//       return null
//     }
//   }

//   // ========================
//   // CONFIGURAÇÕES AVANÇADAS
//   // ========================

//   public async setIntegrationTime(timeCode: number): Promise<boolean> {
//     console.log(`🔧 Definindo tempo de integração: ${timeCode}`)
//     const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
//     if (currentValue === null) return false
//     const gain = currentValue & 0xff
//     const newValue = (timeCode << 8) | gain
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
//   }

//   public async setGain(gainCode: number): Promise<boolean> {
//     console.log(`🔧 Definindo ganho: ${gainCode}`)
//     const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
//     if (currentValue === null) return false
//     const time = currentValue & 0xff00
//     const newValue = time | gainCode
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
//   }

//   public async setOffset(offsetValue: number): Promise<boolean> {
//     console.log(`🔧 Definindo offset: ${offsetValue}`)
//     return this.writeRegister(WhitekonRegisters.OFFSET, offsetValue)
//   }

//   public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
//     console.log(`🔧 Definindo limites de brancura: ${min} - ${max}`)
//     const minSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, min)
//     if (!minSuccess) return false
//     const maxSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, max)
//     return maxSuccess
//   }

//   public async setLedTimes(tempoLigado: number, tempoDesligado: number): Promise<boolean> {
//     console.log(`🔧 Definindo tempos do LED: ligado=${tempoLigado}ms, desligado=${tempoDesligado}ms`)
//     const ligadoSuccess = await this.writeRegister(WhitekonRegisters.TEMPO_LED_LIGADO, tempoLigado)
//     if (!ligadoSuccess) return false
//     const desligadoSuccess = await this.writeRegister(WhitekonRegisters.TEMPO_LED_DESLIGADO, tempoDesligado)
//     return desligadoSuccess
//   }

//   public async setCalibrationValues(escuro: number, claro: number): Promise<boolean> {
//     console.log(`🔧 Definindo valores de calibração: escuro=${escuro}, claro=${claro}`)
//     const escuroSuccess = await this.writeRegister(WhitekonRegisters.VALOR_ESCURO_PADRAO, escuro)
//     if (!escuroSuccess) return false
//     const claroSuccess = await this.writeRegister(WhitekonRegisters.VALOR_CLARO_PADRAO, claro)
//     return claroSuccess
//   }
// }






// lib/whitekon-service.ts

import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

export interface WhitekonData {
  registers: { [key: number]: number | null }
  brancura?: {
    media: number | null
    online: number | null
    desvio_padrao: number | null
  }
  // ... outras propriedades
}

export class WhitekonService {
  private static instance: WhitekonService
  private connected = false
  private pollingInterval: NodeJS.Timeout | null = null
  private statusCheckInterval: NodeJS.Timeout | null = null
  private data: WhitekonData | null = null
  private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = []
  
  // [MODIFIED] - Parâmetros são a "fonte da verdade"
  private currentPort = ""
  private currentBaudRate = 115200
  private currentAddress = 4

  private isBusy = false
  private lastStatusCheck = 0

  private constructor() {}

  public static getInstance(): WhitekonService {
    if (!WhitekonService.instance) {
      WhitekonService.instance = new WhitekonService()
    }
    return WhitekonService.instance
  }
  
  // Helper para construir a URL base com parâmetros de conexão
  private buildApiUrl(action: string, params: Record<string, any> = {}): string {
    const query = new URLSearchParams({
      action,
      port: this.currentPort,
      baudrate: String(this.currentBaudRate),
      unit: String(this.currentAddress),
      ...params,
    });
    return `/api/whitekon?${query.toString()}`;
  }

  public async connect(
    portName: string,
    baudRateStr: string,
    addressStr: string,
    signal?: AbortSignal,
  ): Promise<boolean> {
    this.currentPort = portName
    this.currentBaudRate = Number.parseInt(baudRateStr, 10)
    this.currentAddress = Number.parseInt(addressStr, 10)

    try {
      // A URL de conexão não precisa mais passar os parâmetros aqui, pois o buildApiUrl fará isso.
      // Contudo, para a primeira conexão, é mais explícito.
      const url = `/api/whitekon?action=connect&port=${encodeURIComponent(this.currentPort)}&baudrate=${this.currentBaudRate}&unit=${this.currentAddress}`;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro na API: ${response.status}`);
      }

      const data = await response.json();
      this.connected = data.status === "connected";

      if (this.connected) {
        this.data = { registers: {} };
        this.startPolling();
        this.startStatusCheck();
      } else {
        this.data = null;
        this.notifyDataUpdate();
      }
      return this.connected;
    } catch (error) {
      this.connected = false;
      this.data = null;
      this.notifyDataUpdate();
      throw error;
    }
  }

  public async disconnect(): Promise<boolean> {
    this.stopPolling();
    this.stopStatusCheck();
    this.connected = false;
    this.data = null;
    this.notifyDataUpdate();
    // A chamada à API é opcional, mas pode ser mantida por consistência
    await fetch('/api/whitekon?action=disconnect');
    return true;
  }

  public isConnected(): boolean {
    return this.connected;
  }
  
  public async readRegister(address: number): Promise<number | null> {
    if (!this.connected) throw new Error("Não conectado");
    if (this.isBusy) return null;
    this.isBusy = true;
    try {
      const url = this.buildApiUrl('read', { register: address });
      const response = await fetch(url);
      if (!response.ok) throw new Error((await response.json()).error);
      const data = await response.json();
      if (this.data?.registers) {
        this.data.registers[address] = data.value;
        this.notifyDataUpdate();
      }
      return data.value;
    } finally {
      this.isBusy = false;
    }
  }

  public async readAllRegisters(): Promise<{ [key: number]: number | null }> {
    if (!this.connected) throw new Error("Não conectado");
    if (this.isBusy) return this.data?.registers || {};
    this.isBusy = true;
    try {
      const url = this.buildApiUrl('read-all');
      const response = await fetch(url);
      if (!response.ok) throw new Error((await response.json()).error);
      const data = await response.json();
      if (this.data) {
        this.data.registers = { ...this.data.registers, ...data.registers };
        this.notifyDataUpdate();
      }
      return data.registers;
    } finally {
      this.isBusy = false;
    }
  }

  public async writeRegister(address: number, value: number): Promise<boolean> {
    if (!this.connected) throw new Error("Não conectado");
    if (this.isBusy) return false;
    this.isBusy = true;
    try {
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          port: this.currentPort,
          baudrate: this.currentBaudRate,
          unit: this.currentAddress,
          register: address,
          value,
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      const result = await response.json();
      if (result.success && this.data?.registers) {
        this.data.registers[address] = value;
        this.notifyDataUpdate();
      }
      return result.success === true;
    } finally {
      this.isBusy = false;
    }
  }
  
  // O restante dos métodos (startPolling, onDataUpdate, etc.) permanecem os mesmos.
  // ... (cole o restante do seu `whitekon-service.ts` aqui)
  public async checkConnectionStatus(): Promise<boolean> {
    const now = Date.now()
    if (now - this.lastStatusCheck < 15000) {
      return this.connected
    }
    this.lastStatusCheck = now

    if (this.isBusy) {
      return this.connected
    }
    
    // Simula um status check lendo um registro
    try {
        await this.readRegister(0);
        this.connected = true;
    } catch(e) {
        this.connected = false;
    }
    
    return this.connected
  }
  
  private startPolling(interval = 1000): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.pollingInterval = setInterval(async () => {
      if (this.connected && !this.isBusy) {
          await this.readAllRegisters();
      }
    }, interval)
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private startStatusCheck(): void {
    if (this.statusCheckInterval) clearInterval(this.statusCheckInterval)
    this.statusCheckInterval = setInterval(async () => {
      await this.checkConnectionStatus()
    }, 60000)
  }

  private stopStatusCheck(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval)
      this.statusCheckInterval = null
    }
  }

  private notifyDataUpdate(): void {
    this.onDataUpdateCallbacks.forEach((callback) => callback(this.data))
  }

  public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
    this.onDataUpdateCallbacks.push(callback)
    return () => {
      this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback)
    }
  }

  public getData(): WhitekonData | null {
    return this.data
  }

  public async setOperationMode(mode: number): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode)
  }
  public async calibrateDark(): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO)
  }
  public async calibrateWhite(): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO)
  }
  public async setAutoMode(auto: boolean): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL)
  }
  public async setIntegrationTime(timeCode: number): Promise<boolean> {
    const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
    if (currentValue === null) return false
    const gain = currentValue & 0xff
    const newValue = (timeCode << 8) | gain
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
  }

  public async setGain(gainCode: number): Promise<boolean> {
    const currentValue = await this.readRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO)
    if (currentValue === null) return false
    const time = currentValue & 0xff00
    const newValue = time | gainCode
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
  }

  public async setOffset(offsetValue: number): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.OFFSET, offsetValue)
  }

  public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
    const minSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, min)
    if (!minSuccess) return false
    const maxSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, max)
    return maxSuccess
  }
}
