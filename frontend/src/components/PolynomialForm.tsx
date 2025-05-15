'use client'

import { useState, useEffect } from 'react'
import { useModbus } from '@/contexts/ModbusContext'

interface PolynomialCoefficients {
  a: number
  b: number
  c: number
}

export function PolynomialForm() {
  const { isConnected, readRegisters, writeRegister } = useModbus()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coefficients, setCoefficients] = useState<PolynomialCoefficients>({
    a: 0,
    b: 0,
    c: 0,
  })

  useEffect(() => {
    if (isConnected) {
      loadCoefficients()
    }
  }, [isConnected])

  const loadCoefficients = async () => {
    try {
      const values = await readRegisters(40, 3) // Registradores 40, 41, 42 para a, b, c
      setCoefficients({
        a: values[0],
        b: values[1],
        c: values[2],
      })
    } catch (error) {
      console.error('Erro ao carregar coeficientes:', error)
      setError('Falha ao carregar coeficientes')
    }
  }

  const handleCoefficientChange = (
    coefficient: keyof PolynomialCoefficients,
    value: number
  ) => {
    setCoefficients((prev) => ({
      ...prev,
      [coefficient]: value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      // Escreve os coeficientes nos registradores 40, 41, 42
      await writeRegister(40, coefficients.a)
      await writeRegister(41, coefficients.b)
      await writeRegister(42, coefficients.c)
    } catch (error) {
      setError('Falha ao salvar coeficientes')
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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coeficiente A
          </label>
          <input
            type="number"
            value={coefficients.a}
            onChange={(e) => handleCoefficientChange('a', Number(e.target.value))}
            step="0.001"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coeficiente B
          </label>
          <input
            type="number"
            value={coefficients.b}
            onChange={(e) => handleCoefficientChange('b', Number(e.target.value))}
            step="0.001"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coeficiente C
          </label>
          <input
            type="number"
            value={coefficients.c}
            onChange={(e) => handleCoefficientChange('c', Number(e.target.value))}
            step="0.001"
            className="w-full p-2 border rounded-md"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Coeficientes'}
        </button>
      </div>
    </div>
  )
} 