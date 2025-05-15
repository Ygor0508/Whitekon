import { Navigation } from '@/components/Navigation'
import { ModbusMonitor } from '@/components/ModbusMonitor'

export default function MonitoringPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Monitoramento Modbus</h1>
        <ModbusMonitor />
      </main>
    </div>
  )
} 