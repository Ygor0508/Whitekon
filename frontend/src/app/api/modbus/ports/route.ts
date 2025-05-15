import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Executa o comando Python para listar portas
    const { stdout } = await execAsync('python -m serial.tools.list_ports')
    
    // Processa a saída para extrair as portas
    const ports = stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('COM'))
      .map(line => line.split(' ')[0])

    return NextResponse.json({ ports })
  } catch (error) {
    console.error('Erro ao listar portas:', error)
    return NextResponse.json(
      { error: 'Falha ao listar portas disponíveis' },
      { status: 500 }
    )
  }
} 