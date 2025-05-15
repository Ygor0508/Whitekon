'use client'

import { useState, useEffect } from 'react'
import { useModbus } from '@/contexts/ModbusContext'

const INTEGRATION_TIMES = [
  { value: 0, label: '24ms' },
  { value: 1, label: '50ms' },
  { value: 2, label: '101ms' },
  { value: 3, label: '154ms' },
  { value: 4, label: '700ms' },
]

const GAIN_VALUES = [
  { value: 0, label: '1x' },
  { value: 1, label: '4x' },
  { value: 2, label: '16x' },
  { value: 3, label: '60x' },
]

// Constantes para os registradores
const REGISTERS = {
  RED: 15,
  GREEN: 16,
  BLUE: 17,
  CLEAR: 18,
  INTEGRATION_TIME: 34,
  GAIN: 35,
  CALIBRATION: 27,
}

export function CalibrationForm() {
  const { isConnected, readRegisters, writeRegister, portName, baudRate, unitId, connectModbus, disconnectModbus } = useModbus()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rgbValues, setRgbValues] = useState({ red: 0, green: 0, blue: 0, clear: 0 })
  const [integrationTime, setIntegrationTime] = useState(0)
  const [gain, setGain] = useState(0)
  const [updateCount, setUpdateCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('')
  const [isReconnecting, setIsReconnecting] = useState(false)

  const checkConnectionParams = () => {
    const issues = []
    
    if (!portName) {
      issues.push('Porta COM não especificada')
    }
    
    if (!baudRate) {
      issues.push('Baudrate não especificado')
    } else if (baudRate !== 115200) {
      issues.push(`Baudrate incorreto: ${baudRate}, esperado: 115200`)
    }
    
    if (!unitId) {
      issues.push('Unit ID não especificado')
    } else if (unitId !== 4) {
      issues.push(`Unit ID incorreto: ${unitId}, esperado: 4`)
    }

    return issues.length > 0 ? issues.join('\n') : ''
  }

  const readRegisterWithRetry = async (register: number, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const value = await readRegisters(register, 1)
        if (value && value.length > 0) {
          return value[0]
        }
        // Se chegou aqui, a leitura retornou vazio
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500)) // Espera 500ms entre tentativas
        }
      } catch (error) {
        if (attempt === maxAttempts) throw error
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    throw new Error('Falha na leitura após várias tentativas')
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    let retryCount = 0
    const maxRetries = 3

    const verifyConnection = async () => {
      try {
        // Verifica parâmetros de conexão primeiro
        console.log('Verificando parâmetros de conexão...')
        console.log('Parâmetros atuais:', {
          porta: portName || 'Não definida',
          baudrate: baudRate || 'Não definido',
          unitId: unitId || 'Não definido'
        })
        
        const paramIssues = checkConnectionParams()
        if (paramIssues) {
          console.error('Problemas encontrados nos parâmetros:', paramIssues)
          throw new Error(`Problemas nos parâmetros de conexão:\n${paramIssues}`)
        }
        
        console.log('Parâmetros de conexão OK')
        
        // Continua com a verificação dos registradores
        console.log('Verificando registradores individualmente...')
        
        const registers = [
          { name: 'RED', value: REGISTERS.RED },
          { name: 'GREEN', value: REGISTERS.GREEN },
          { name: 'BLUE', value: REGISTERS.BLUE },
          { name: 'CLEAR', value: REGISTERS.CLEAR }
        ]
        
        let failedRegisters = []
        let successfulReads = []
        
        for (const reg of registers) {
          try {
            console.log(`Testando registro ${reg.name} (${reg.value})...`)
            const value = await readRegisters(reg.value, 1)
            console.log(`Leitura ${reg.name}:`, value)
            
            if (!value || value.length === 0) {
              console.error(`Falha na leitura do registro ${reg.name}: valor vazio`)
              failedRegisters.push(reg.name)
            } else {
              successfulReads.push(`${reg.name}: ${value[0]}`)
            }
          } catch (error) {
            console.error(`Erro ao ler registro ${reg.name}:`, error)
            failedRegisters.push(reg.name)
          }
        }
        
        if (failedRegisters.length > 0) {
          const errorMsg = `Falha na leitura dos registradores: ${failedRegisters.join(', ')}`
          if (successfulReads.length > 0) {
            console.log('Leituras bem sucedidas:', successfulReads.join(', '))
          }
          throw new Error(errorMsg)
        }
        
        console.log('Todos os registradores verificados com sucesso')
        console.log('Valores lidos:', successfulReads.join(', '))
        
        return true
      } catch (error) {
        throw error
      }
    }

    const startUpdates = async () => {
      if (isConnected && !isReconnecting) {
        try {
          // Tenta uma primeira leitura
          await updateRGBValues()
          
          // Se bem sucedido, inicia as atualizações periódicas
          interval = setInterval(updateRGBValues, 1000)
        } catch (error) {
          // Se falhar, tenta reconectar
          reconnectDevice()
        }
      }
    }

    startUpdates()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isConnected, isReconnecting])

  const loadInitialValues = async () => {
    if (!isConnected) return

    try {
      console.log('Carregando valores iniciais...')
      
      // Lê cada valor separadamente para identificar qual falha
      console.log('Lendo tempo de integração...')
      const timeValue = await readRegisters(REGISTERS.INTEGRATION_TIME, 1)
      console.log('Tempo de integração:', timeValue)
      
      console.log('Lendo ganho...')
      const gainValue = await readRegisters(REGISTERS.GAIN, 1)
      console.log('Ganho:', gainValue)
      
      setIntegrationTime(timeValue[0])
      setGain(gainValue[0])
      setError('')
    } catch (error) {
      console.error('Erro detalhado ao carregar valores iniciais:', error)
      setError('Falha ao carregar configurações. Tente reconectar ao dispositivo.')
      throw error
    }
  }

  const updateRGBValues = async () => {
    if (!isConnected) return

    try {
      // Tenta ler todos os valores com retry
      const [red, green, blue, clear] = await Promise.all([
        readRegisterWithRetry(REGISTERS.RED),
        readRegisterWithRetry(REGISTERS.GREEN),
        readRegisterWithRetry(REGISTERS.BLUE),
        readRegisterWithRetry(REGISTERS.CLEAR)
      ])

      // Verifica se os valores estão dentro dos limites esperados (0-65535)
      const isValidValue = (value: number) => value >= 0 && value <= 65535
      if (!isValidValue(red) || !isValidValue(green) || !isValidValue(blue) || !isValidValue(clear)) {
        throw new Error('Valores fora dos limites esperados')
      }

      setRgbValues({
        red,
        green,
        blue,
        clear
      })
      
      setUpdateCount(prev => prev + 1)
      setError('')
    } catch (error) {
      // Se falhar, tenta reconectar automaticamente
      if (!isReconnecting) {
        reconnectDevice()
      }
    }
  }

  const handleCalibration = async (type: 'black' | 'white') => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const value = type === 'black' ? 0x5501 : 0x5502
      console.log(`Iniciando calibração ${type}...`)
      
      // Verifica se está conectado antes de prosseguir
      if (!isConnected) {
        throw new Error('Dispositivo não está conectado')
      }
      
      // Tenta escrever o comando de calibração
      await writeRegister(REGISTERS.CALIBRATION, value)
      console.log('Comando de calibração enviado com sucesso')
      
      // Aguarda um pouco para a calibração completar
      console.log('Aguardando conclusão da calibração...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Tenta ler os novos valores após a calibração
      console.log('Atualizando valores após calibração...')
      await updateRGBValues()
      console.log('Calibração concluída com sucesso')
      setSuccess(`Calibração ${type === 'black' ? 'preta' : 'branca'} realizada com sucesso!`)
    } catch (error) {
      console.error(`Erro detalhado na calibração ${type}:`, error)
      setError(`Falha na calibração ${type === 'black' ? 'preta' : 'branca'}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleIntegrationTimeChange = async (value: number) => {
    try {
      setError('')
      setSuccess('')
      console.log('Alterando tempo de integração para:', value)
      await writeRegister(REGISTERS.INTEGRATION_TIME, value)
      setIntegrationTime(value)
      
      // Atualiza valores após mudança
      await updateRGBValues()
      setSuccess('Tempo de integração alterado com sucesso')
    } catch (error) {
      console.error('Erro ao definir tempo de integração:', error)
      setError('Falha ao definir tempo de integração')
    }
  }

  const handleGainChange = async (value: number) => {
    try {
      setError('')
      setSuccess('')
      console.log('Alterando ganho para:', value)
      await writeRegister(REGISTERS.GAIN, value)
      setGain(value)
      
      // Atualiza valores após mudança
      await updateRGBValues()
      setSuccess('Ganho alterado com sucesso')
    } catch (error) {
      console.error('Erro ao definir ganho:', error)
      setError('Falha ao definir ganho')
    }
  }

  const reconnectDevice = async () => {
    if (isReconnecting) return
    
    try {
      setIsReconnecting(true)
      setError('')
      
      // Primeiro desconecta
      await disconnectModbus()
      
      // Aguarda 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Tenta reconectar
      await connectModbus(portName, baudRate, unitId)
      
      // Aguarda mais 1 segundo para estabilizar
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Tenta uma leitura de teste
      const testRead = await readRegisters(REGISTERS.RED, 1)
      if (!testRead || testRead.length === 0) {
        throw new Error('Falha no teste de leitura após reconexão')
      }
      
      setSuccess('Dispositivo reconectado com sucesso')
      setError('')
      
      // Reinicia as leituras
      await updateRGBValues()
      
    } catch (error) {
      setError('Falha na reconexão. Por favor, verifique o dispositivo e tente novamente.')
    } finally {
      setIsReconnecting(false)
    }
  }

  // Botão de reconexão manual
  const ReconnectButton = () => (
    <button
      onClick={reconnectDevice}
      disabled={isReconnecting || !isConnected}
      className="w-full py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
    >
      {isReconnecting ? 'Reconectando...' : 'Reconectar Dispositivo'}
    </button>
  )

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        Por favor, conecte-se ao dispositivo primeiro.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Sucesso</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {connectionStatus && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Status da Conexão</h3>
              <div className="mt-2 text-sm text-blue-700">{connectionStatus}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Valores RGB (Atualização: {updateCount})</h2>
          <ReconnectButton />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="p-3 bg-red-50 rounded-md">
            <div className="text-red-700 font-medium">Vermelho</div>
            <div className="text-2xl">{rgbValues.red}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <div className="text-green-700 font-medium">Verde</div>
            <div className="text-2xl">{rgbValues.green}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-blue-700 font-medium">Azul</div>
            <div className="text-2xl">{rgbValues.blue}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-gray-700 font-medium">Clear</div>
            <div className="text-2xl">{rgbValues.clear}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Calibração</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => handleCalibration('black')}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? 'Calibrando...' : 'Calibrar Preto'}
            </button>
            <button
              onClick={() => handleCalibration('white')}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Calibrando...' : 'Calibrar Branco'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo de Integração
            </label>
            <select
              value={integrationTime}
              onChange={(e) => handleIntegrationTimeChange(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              {INTEGRATION_TIMES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ganho
            </label>
            <select
              value={gain}
              onChange={(e) => handleGainChange(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              disabled={loading}
            >
              {GAIN_VALUES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
} 