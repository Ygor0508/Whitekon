'use client'

import { useState, useEffect } from 'react'
import { useModbus } from '@/contexts/ModbusContext'

interface RegisterValue {
  address: number
  value: number
  hex: string
}

export function ModbusMonitor() {
  const { isConnected, readRegisters } = useModbus()
  const [startAddress, setStartAddress] = useState(0)
  const [registerCount, setRegisterCount] = useState(10)
  const [values, setValues] = useState<RegisterValue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoUpdate, setAutoUpdate] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isConnected && autoUpdate) {
      interval = setInterval(readValues, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isConnected, autoUpdate, startAddress, registerCount])

  const readValues = async () => {
    if (!isConnected || loading) return

    setLoading(true)
    setError('')

    try {
      const registers = await readRegisters(startAddress, registerCount)
      const formattedValues = registers.map((value, index) => ({
        address: startAddress + index,
        value,
        hex: `0x${value.toString(16).toUpperCase().padStart(4, '0')}`,
      }))
      setValues(formattedValues)
    } catch (error) {
      console.error('Erro na leitura:', error)
      setError('Falha ao ler registradores')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        Por favor, conecte-se ao dispositivo primeiro.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço Inicial
              </label>
              <input
                type="number"
                value={startAddress}
                onChange={(e) => setStartAddress(Number(e.target.value))}
                min={0}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de Registradores
              </label>
              <input
                type="number"
                value={registerCount}
                onChange={(e) => setRegisterCount(Number(e.target.value))}
                min={1}
                max={125}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={readValues}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Lendo...' : 'Ler Registradores'}
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="rounded text-blue-500"
              />
              <span className="text-sm text-gray-700">Atualização Automática</span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </div>
      </div>

      {values.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Endereço</th>
                <th className="text-left py-2 px-4">Valor (Dec)</th>
                <th className="text-left py-2 px-4">Valor (Hex)</th>
              </tr>
            </thead>
            <tbody>
              {values.map(({ address, value, hex }) => (
                <tr key={address} className="border-b">
                  <td className="py-2 px-4">{address}</td>
                  <td className="py-2 px-4">{value}</td>
                  <td className="py-2 px-4 font-mono">{hex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 