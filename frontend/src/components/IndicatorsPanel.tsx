'use client'

import { useState, useEffect } from 'react'
import { useModbus } from '@/contexts/ModbusContext'

interface Indicators {
  whitenessOnline: number
  whitenessAverage: number
  standardDeviation: number
  sampleCount: number
  temperatureOnline: number
  temperatureCalibration: number
}

export function IndicatorsPanel() {
  const { isConnected, readRegisters } = useModbus()
  const [indicators, setIndicators] = useState<Indicators>({
    whitenessOnline: 0,
    whitenessAverage: 0,
    standardDeviation: 0,
    sampleCount: 0,
    temperatureOnline: 0,
    temperatureCalibration: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isConnected) {
      updateIndicators()
      const interval = setInterval(updateIndicators, 1000)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  const updateIndicators = async () => {
    try {
      const values = await readRegisters(10, 6) // Registradores 10-15
      setIndicators({
        whitenessOnline: values[0] / 100, // Escala para valor real
        whitenessAverage: values[1] / 100,
        standardDeviation: values[2] / 100,
        sampleCount: values[3],
        temperatureOnline: values[4] / 10, // Escala para valor real
        temperatureCalibration: values[5] / 10,
      })
      setError('')
    } catch (error) {
      console.error('Erro ao ler indicadores:', error)
      setError('Falha ao atualizar indicadores')
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Indicadores de Brancura */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Brancura</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Brancura Online</div>
              <div className="text-2xl font-semibold">
                {indicators.whitenessOnline.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Brancura Média</div>
              <div className="text-2xl font-semibold">
                {indicators.whitenessAverage.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Desvio Padrão</div>
              <div className="text-2xl font-semibold">
                {indicators.standardDeviation.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Número de Amostras</div>
              <div className="text-2xl font-semibold">
                {indicators.sampleCount}
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de Temperatura */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Temperatura</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Temperatura Online</div>
              <div className="text-2xl font-semibold">
                {indicators.temperatureOnline.toFixed(1)}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Temperatura de Calibração</div>
              <div className="text-2xl font-semibold">
                {indicators.temperatureCalibration.toFixed(1)}°C
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  )
} 