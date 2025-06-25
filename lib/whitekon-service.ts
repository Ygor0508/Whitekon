import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

export interface WhitekonData {
  registers: { [key: number]: number | null }
  // Dados decodificados da nova API
  brancura?: {
    media: number | null
    online: number | null
    desvio_padrao: number | null
  }
  temperatura?: {
    calibracao: number | null
    online: number | null
  }
  rgb?: {
    red: number | null
    green: number | null
    blue: number | null
    clear: number | null
  }
  blue_calibracao?: {
    preto: number | null
    branco: number | null
  }
  amostras?: number | null
  alarmes?: number | null
}

export class WhitekonService {
  private static instance: WhitekonService
  private connected = false
  private pollingInterval: NodeJS.Timeout | null = null
  private statusCheckInterval: NodeJS.Timeout | null = null
  private data: WhitekonData | null = null
  private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = []
  private currentPort = ""
  private currentBaudRate = 115200
  private currentAddress = 4
  private isBusy = false // Flag para evitar operações simultâneas
  private lastStatusCheck = 0 // Throttling para status check

  private constructor() {}

  public static getInstance(): WhitekonService {
    if (!WhitekonService.instance) {
      WhitekonService.instance = new WhitekonService()
    }
    return WhitekonService.instance
  }

  public async connect(
    portName: string,
    baudRateStr: string,
    addressStr: string,
    signal?: AbortSignal,
  ): Promise<boolean> {
    try {
      const baudRate = Number.parseInt(baudRateStr, 10)
      const address = Number.parseInt(addressStr, 10)

      this.currentPort = portName
      this.currentBaudRate = baudRate
      this.currentAddress = address

      const url = `/api/whitekon?action=connect&port=${encodeURIComponent(portName)}&baudrate=${baudRate}&unit=${address}`

      const response = await fetch(url, { signal })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro na resposta da API:", errorData)
        throw new Error(errorData.error || `Erro na resposta da API: ${response.status}`)
      }

      const data = await response.json()
      this.connected = data.status === "connected"

      if (this.connected) {
        this.data = { registers: {} }
        this.startPolling()
        this.startStatusCheck()
      } else {
        this.data = null
        this.notifyDataUpdate()
      }

      return this.connected
    } catch (error) {
      console.error("Erro ao conectar:", error)
      this.connected = false
      this.data = null
      this.notifyDataUpdate()
      throw error
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      this.stopPolling()
      this.stopStatusCheck()

      const response = await fetch("/api/whitekon?action=disconnect")
      const data = await response.json()
      this.connected = !(data.status === "disconnected")

      this.data = null
      this.notifyDataUpdate()

      return !this.connected
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      return false
    }
  }

  public isConnected(): boolean {
    return this.connected
  }

  public async checkConnectionStatus(): Promise<boolean> {
    const now = Date.now()
    if (now - this.lastStatusCheck < 15000) {
      return this.connected
    }
    this.lastStatusCheck = now

    if (this.isBusy) {
      return this.connected
    }

    try {
      const response = await fetch("/api/whitekon?action=status")
      const data = await response.json()
      const wasConnected = this.connected
      this.connected = data.connected
      if (wasConnected && !this.connected) {
        this.data = null
        this.notifyDataUpdate()
      }
      return this.connected
    } catch (error) {
      return this.connected
    }
  }

  public async readRegister(address: number): Promise<number | null> {
    if (!this.connected) throw new Error("Não conectado")
    if (this.isBusy) {
      console.warn(`Tentativa de leitura no registro ${address} ignorada: comunicação em andamento.`)
      return null
    }

    this.isBusy = true
    try {
      const response = await fetch(`/api/whitekon?action=read&register=${address}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao ler registro ${address}`)
      }
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      if (this.data?.registers) {
        this.data.registers[address] = data.value
        this.notifyDataUpdate()
      }
      return data.value
    } catch (error) {
      console.error(`Erro ao ler registro ${address}:`, error)
      throw error
    } finally {
      this.isBusy = false
    }
  }

  public async readRegisters(startAddress: number, count: number): Promise<number[]> {
    if (!this.connected) throw new Error("Não conectado")
    if (this.isBusy) {
      console.warn(`Tentativa de leitura de ${count} registros a partir de ${startAddress} ignorada.`)
      return []
    }

    this.isBusy = true
    try {
      const response = await fetch(`/api/whitekon?action=read&register=${startAddress}&count=${count}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao ler múltiplos registros")
      }
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      if (this.data?.registers && data.values) {
        data.values.forEach((value: number, index: number) => {
          this.data!.registers[startAddress + index] = value
        })
        this.notifyDataUpdate()
      }
      return data.values || []
    } catch (error) {
      console.error(`Erro ao ler múltiplos registros:`, error)
      throw error
    } finally {
      this.isBusy = false
    }
  }
  
  public async readAllRegisters(): Promise<{ [key: number]: number | null }> {
    if (!this.connected) throw new Error("Não conectado");
    if (this.isBusy) {
      console.warn("Leitura de todos os registros ignorada: comunicação em andamento.");
      return this.data?.registers || {};
    }
  
    this.isBusy = true;
    try {
      const response = await fetch("/api/whitekon?action=read-all");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao ler todos os registros");
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
  
      if (this.data) {
        this.data.registers = { ...this.data.registers, ...data.registers };
        this.notifyDataUpdate();
      }
      return data.registers;
    } catch (error) {
      console.error("Erro ao ler todos os registros:", error);
      throw error;
    } finally {
      this.isBusy = false;
    }
  }

  public async writeRegister(address: number, value: number): Promise<boolean> {
    if (!this.connected) throw new Error("Não conectado")
    if (this.isBusy) {
      console.warn(`Tentativa de escrita no registro ${address} ignorada: comunicação em andamento.`)
      return false
    }

    this.isBusy = true
    try {
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ register: address, value }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao escrever no registro ${address}`)
      }
      const result = await response.json()
      if (result.success && this.data?.registers) {
        this.data.registers[address] = value
        this.notifyDataUpdate()
      }
      return result.success === true
    } catch (error) {
      console.error(`Erro ao escrever no registro ${address}:`, error)
      throw error
    } finally {
      this.isBusy = false
    }
  }

  private startPolling(interval = 8000): void {
    if (this.pollingInterval) clearInterval(this.pollingInterval)
    this.pollingInterval = setInterval(async () => {
      // ... (código de polling existente)
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

  // Métodos de atalho
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

  // Métodos adicionados para corrigir os erros
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
    // A lógica no componente multiplica por 10, então assumimos o valor já ajustado
    return this.writeRegister(WhitekonRegisters.OFFSET, offsetValue)
  }

  public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
    const minSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, min)
    if (!minSuccess) return false
    const maxSuccess = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, max)
    return maxSuccess
  }
}