import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

export interface WhitekonData {
  // Dados reais dos registradores - sem simulação
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
  private isReading = false // Flag para evitar leituras simultâneas
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
        // Inicializa o cache de dados
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
    // Throttling: só verifica a cada 15 segundos
    const now = Date.now()
    if (now - this.lastStatusCheck < 15000) {
      return this.connected
    }
    this.lastStatusCheck = now

    // Não verifica status se estiver lendo dados
    if (this.isReading) {
      return this.connected
    }

    try {
      const response = await fetch("/api/whitekon?action=status")
      const data = await response.json()

      const wasConnected = this.connected
      this.connected = data.connected

      // Só limpa dados se realmente perdeu conexão
      if (wasConnected && !this.connected) {
        console.log("Conexão perdida detectada")
        this.data = null
        this.notifyDataUpdate()
      }

      return this.connected
    } catch (error) {
      console.error("Erro ao verificar status da conexão:", error)
      // Não marca como desconectado em caso de erro temporário
      return this.connected
    }
  }

  // Lê um registro específico
  public async readRegister(address: number): Promise<number | null> {
    if (!this.connected) {
      throw new Error("Não conectado")
    }

    if (this.isReading) {
      throw new Error("Operação de leitura em andamento")
    }

    this.isReading = true
    try {
      console.log(`Lendo registro ${address}...`)
      const response = await fetch(`/api/whitekon?action=read&register=${address}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao ler registro ${address}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      console.log(`Registro ${address} lido: ${data.value}`)

      // Atualiza o registro no cache local
      if (this.data) {
        this.data.registers[address] = data.value
        this.notifyDataUpdate()
      }

      return data.value
    } catch (error) {
      console.error(`Erro ao ler registro ${address}:`, error)
      throw error
    } finally {
      this.isReading = false
    }
  }

  // Lê múltiplos registros com retry e delay
  public async readRegisters(startAddress: number, count: number): Promise<number[]> {
    if (!this.connected) {
      throw new Error("Não conectado")
    }

    if (this.isReading) {
      throw new Error("Operação de leitura em andamento")
    }

    this.isReading = true
    try {
      // Limita o tamanho do bloco para evitar timeouts
      const maxBlockSize = 3
      const actualCount = Math.min(count, maxBlockSize)

      console.log(`Lendo registros ${startAddress}-${startAddress + actualCount - 1}...`)
      const response = await fetch(`/api/whitekon?action=read&register=${startAddress}&count=${actualCount}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao ler registros ${startAddress}-${startAddress + actualCount - 1}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      console.log(`Registros ${startAddress}-${startAddress + actualCount - 1} lidos:`, data.values)

      // Atualiza os registros no cache local
      if (this.data && data.values) {
        data.values.forEach((value: number, index: number) => {
          this.data!.registers[startAddress + index] = value
        })
        this.notifyDataUpdate()
      }

      return data.values || []
    } catch (error) {
      console.error(`Erro ao ler registros ${startAddress}-${startAddress + count - 1}:`, error)
      throw error
    } finally {
      this.isReading = false
    }
  }

  // Nova função para ler todos os registros (0-56) usando a nova API
  public async readAllRegisters(): Promise<{ [key: number]: number | null }> {
    if (!this.connected) {
      throw new Error("Não conectado")
    }

    if (this.isReading) {
      throw new Error("Operação de leitura em andamento")
    }

    this.isReading = true
    try {
      console.log("Iniciando leitura de todos os registros...")

      const response = await fetch("/api/whitekon?action=read-all")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao ler todos os registros")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      console.log(`Leitura concluída: ${data.summary.success}/${data.summary.total} registros`)

      // Atualiza o cache com todos os registros lidos
      if (this.data) {
        this.data.registers = { ...this.data.registers, ...data.registers }
        this.notifyDataUpdate()
      }

      return data.registers
    } catch (error) {
      console.error("Erro ao ler todos os registros:", error)
      throw error
    } finally {
      this.isReading = false
    }
  }

  // Escreve em um registro
  public async writeRegister(address: number, value: number): Promise<boolean> {
    if (!this.connected) {
      throw new Error("Não conectado")
    }

    if (this.isReading) {
      throw new Error("Operação de leitura em andamento")
    }

    try {
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ register: address, value }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao escrever no registro ${address}`)
      }

      const result = await response.json()

      // Atualiza o cache local se a escrita foi bem-sucedida
      if (result.success && this.data) {
        this.data.registers[address] = value
        this.notifyDataUpdate()
      }

      return result.success === true
    } catch (error) {
      console.error(`Erro ao escrever no registro ${address}:`, error)
      throw error
    }
  }

  private startPolling(interval = 8000): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.connected || this.isReading) {
          return
        }

        // Lê apenas dados essenciais para o dashboard
        const response = await fetch("/api/whitekon?action=data")

        if (!response.ok) {
          console.error("Erro ao obter dados do dashboard:", response.status)
          return
        }

        const dashboardData = await response.json()

        if (dashboardData.error) {
          console.error("Erro nos dados do dashboard:", dashboardData.error)
          return
        }

        // Converte os dados decodificados para o formato de registros
        const registers: { [key: number]: number | null } = this.data?.registers || {}

        // Mapeia os dados decodificados de volta para registros (com valores corretos)
        if (dashboardData.brancura) {
          if (dashboardData.brancura.media !== null) registers[5] = Math.round(dashboardData.brancura.media * 10)
          if (dashboardData.brancura.online !== null) registers[21] = Math.round(dashboardData.brancura.online * 10)
          if (dashboardData.brancura.desvio_padrao !== null)
            registers[11] = Math.round(dashboardData.brancura.desvio_padrao * 100)
        }

        if (dashboardData.temperatura) {
          if (dashboardData.temperatura.calibracao !== null)
            registers[6] = Math.round(dashboardData.temperatura.calibracao * 10)
          if (dashboardData.temperatura.online !== null)
            registers[7] = Math.round(dashboardData.temperatura.online * 10)
        }

        if (dashboardData.rgb) {
          if (dashboardData.rgb.red !== null) registers[15] = dashboardData.rgb.red
          if (dashboardData.rgb.green !== null) registers[16] = dashboardData.rgb.green
          if (dashboardData.rgb.blue !== null) registers[17] = dashboardData.rgb.blue
          if (dashboardData.rgb.clear !== null) registers[18] = dashboardData.rgb.clear
        }

        if (dashboardData.blue_calibracao) {
          if (dashboardData.blue_calibracao.preto !== null) registers[8] = dashboardData.blue_calibracao.preto
          if (dashboardData.blue_calibracao.branco !== null) registers[9] = dashboardData.blue_calibracao.branco
        }

        if (dashboardData.amostras !== null) registers[19] = dashboardData.amostras
        if (dashboardData.alarmes !== null) registers[10] = dashboardData.alarmes

        this.data = {
          registers,
          ...dashboardData, // Inclui também os dados decodificados
        }
        this.notifyDataUpdate()
      } catch (error) {
        console.error("Erro no polling:", error)
        // Não limpa os dados em caso de erro temporário
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
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval)
    }

    // Verifica status apenas a cada 60 segundos
    this.statusCheckInterval = setInterval(async () => {
      if (!this.isReading) {
        await this.checkConnectionStatus()
      }
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

  // Métodos específicos para comandos WhiteKon
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

  public async setLedControl(enabled: boolean): Promise<boolean> {
    const currentValue = this.data?.registers[WhitekonRegisters.CONTROLE_REMOTO] || 0
    const newValue = enabled ? currentValue | 1 : currentValue & ~1
    return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue)
  }

  public async setBobinControl(enabled: boolean): Promise<boolean> {
    const currentValue = this.data?.registers[WhitekonRegisters.CONTROLE_REMOTO] || 0
    const newValue = enabled ? currentValue | 2 : currentValue & ~2
    return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newValue)
  }

  public async setIntegrationTimeAndGain(timeCode: number, gainCode: number): Promise<boolean> {
    const value = (timeCode << 8) | gainCode
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, value)
  }

  public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
    const minResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, Math.round(min * 10))
    const maxResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, Math.round(max * 10))
    return minResult && maxResult
  }

  public async setOffset(offset: number): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.OFFSET, Math.round(offset * 10))
  }

  public async setIntegrationTime(timeCode: number): Promise<boolean> {
    const currentValue = this.data?.registers[WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO] || 0
    const gainCode = currentValue & 0xff // Preserva o ganho atual
    const newValue = (timeCode << 8) | gainCode
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
  }

  public async setGain(gainCode: number): Promise<boolean> {
    const currentValue = this.data?.registers[WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO] || 0
    const timeCode = (currentValue >> 8) & 0xff // Preserva o tempo de integração atual
    const newValue = (timeCode << 8) | gainCode
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, newValue)
  }
}
