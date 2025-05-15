'use client'

import { useState, useEffect } from 'react'
import { useModbus } from '@/contexts/ModbusContext'

const BAUD_RATES = [9600, 19200, 38400, 115200]

export function ConnectionForm() {
  const { isConnected, connectModbus, disconnectModbus, baudRate: contextBaudRate, unitId: contextUnitId } = useModbus()
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState('')
  const [baudRate, setBaudRate] = useState(contextBaudRate || 9600)
  const [unitId, setUnitId] = useState(contextUnitId || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sincroniza com os valores do contexto quando mudam
  useEffect(() => {
    if (contextBaudRate > 0) setBaudRate(contextBaudRate)
    if (contextUnitId > 0) setUnitId(contextUnitId)
  }, [contextBaudRate, contextUnitId])

  // Aviso ao tentar fechar a página com conexão ativa
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnected) {
        e.preventDefault()
        e.returnValue = 'Você tem uma conexão Modbus ativa. Tem certeza que deseja sair?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isConnected])

  useEffect(() => {
    fetchPorts()
  }, [])

  const fetchPorts = async () => {
    try {
      const response = await fetch('/api/modbus/ports')
      const data = await response.json()
      setAvailablePorts(data.ports)
      if (data.ports.length > 0) {
        setSelectedPort(data.ports[0])
      }
    } catch (error) {
      console.error('Erro ao buscar portas:', error)
      setError('Falha ao carregar portas disponíveis')
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setError('')
    try {
      await connectModbus(selectedPort, baudRate, unitId)
    } catch (error) {
      setError('Falha ao conectar ao dispositivo')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Tem certeza que deseja desconectar? Isso afetará todas as telas que estão usando a conexão.')) {
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await disconnectModbus()
    } catch (error) {
      setError('Falha ao desconectar do dispositivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Conexão Modbus</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Porta Serial</label>
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            disabled={isConnected || loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {availablePorts.map(port => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Baud Rate</label>
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={isConnected || loading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {BAUD_RATES.map(rate => (
              <option key={rate} value={rate}>{rate}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ID da Unidade</label>
          <input
            type="number"
            value={unitId}
            onChange={(e) => setUnitId(Number(e.target.value))}
            disabled={isConnected || loading}
            min={1}
            max={247}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleConnect}
            disabled={isConnected || loading || !selectedPort}
            className={`px-4 py-2 rounded-md text-white ${
              isConnected || loading || !selectedPort
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Conectando...' : 'Conectar'}
          </button>

          <button
            onClick={handleDisconnect}
            disabled={!isConnected || loading}
            className={`px-4 py-2 rounded-md text-white ${
              !isConnected || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Desconectando...' : 'Desconectar'}
          </button>
        </div>

        {isConnected && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">
              Conectado em {selectedPort} a {baudRate} bps (ID: {unitId})
            </p>
            <p className="text-xs text-green-600 mt-1">
              A conexão será mantida até que você desconecte manualmente ou feche a aplicação.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 