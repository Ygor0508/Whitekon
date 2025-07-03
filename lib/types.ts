// lib/types.ts
export interface WhiteKon {
  id: string
  name: string
  rtuAddress: number
  machineName: string
  port?: string
  baudRate?: number
  isConnected: boolean
  lastConnection?: Date
  createdAt: Date
  updatedAt: Date
}

export interface WhiteKonData {
  // qualquer coisa só tirar registers e error
  registers: { [key: number]: number | null }
  error?: boolean
  // Dados de leitura
  brancuraMedia: number | null
  brancuraOnline: number | null
  brancuraSemCorrecao: number | null
  desvPadrao: number | null
  tempCalibracao: number | null
  tempOnline: number | null

  // RGB
  red: number | null
  green: number | null
  blue: number | null
  clear: number | null

  // Calibração
  bluePreto: number | null
  blueBranco: number | null

  // Contadores e status
  contadorAmostras: number | null
  alarmes: number | null
  modoOperacao: number | null

  // Parâmetros configuráveis
  tempoLedDesligado: number | null
  tempoLedLigado: number | null
  valorEscuroPadrao: number | null
  valorClaroPadrao: number | null
  offset: number | null
  brancuraMinima: number | null
  brancuraMaxima: number | null
  escuroMaximo: number | null
  claroMinimo: number | null

  // Coeficientes de correção
  coefATempA: number | null
  coefATempB: number | null
  coefATempC: number | null
  coefACorrecaoA: number | null
  coefACorrecaoB: number | null
  coefACorrecaoC: number | null

  // Configurações
  tempoIntegracao: number | null
  ganho: number | null
  controleRemoto: number | null
  automaticoManual: number | null
}

export interface AlarmInfo {
  bit: number
  type: "CALIBRAÇÃO" | "FUNCIONAMENTO"
  description: string
}

export const ALARM_TYPES: AlarmInfo[] = [
  { bit: 0, type: "CALIBRAÇÃO", description: "Escuro > Claro" },
  { bit: 1, type: "CALIBRAÇÃO", description: "Escuro = Claro (com margem)" },
  { bit: 2, type: "CALIBRAÇÃO", description: "Saiu do modo de calibração s/ calibrar os dois" },
  { bit: 3, type: "CALIBRAÇÃO", description: "Escuro > 3000" },
  { bit: 4, type: "CALIBRAÇÃO", description: "Claro < 4000" },
  { bit: 5, type: "CALIBRAÇÃO", description: "Muito tempo em modo de calibração" },
  { bit: 6, type: "CALIBRAÇÃO", description: "Indicação que foi realizada a calibração correta" },
  { bit: 8, type: "FUNCIONAMENTO", description: "Valor de brancura muito alto" },
  { bit: 9, type: "FUNCIONAMENTO", description: "Valor de brancura muito baixo" },
  { bit: 10, type: "FUNCIONAMENTO", description: "Sem leitura do sensor (Blue = 0)" },
  { bit: 11, type: "FUNCIONAMENTO", description: "Erro na leitura de temperatura (T = 0)" },
  { bit: 12, type: "FUNCIONAMENTO", description: "Sensor desconectado brancura" },
]

export const INTEGRATION_TIME_CODES = [
  { code: 0, value: "2,4 ms" },
  { code: 1, value: "24 ms" },
  { code: 2, value: "50 ms" },
  { code: 3, value: "101 ms" },
  { code: 4, value: "154 ms" },
  { code: 5, value: "700 ms" },
]

export const GAIN_CODES = [
  { code: 0, value: "1x" },
  { code: 1, value: "4x" },
  { code: 2, value: "16x" },
  { code: 3, value: "60x" },
]

export const OPERATION_MODES = [
  { code: 0, value: "Operação normal" },
  { code: 1, value: "Calibração" },
  { code: 2, value: "Limpeza" },
  { code: 3, value: "Máquina Parada" },
]




