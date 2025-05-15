import { Navigation } from '@/components/Navigation'
import { CalibrationForm } from '@/components/CalibrationForm'

export default function CalibrationPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Calibração do Sensor</h1>
        <CalibrationForm />
      </main>
    </div>
  )
} 