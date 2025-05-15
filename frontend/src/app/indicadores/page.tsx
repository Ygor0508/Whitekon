import { Navigation } from '@/components/Navigation'
import { IndicatorsPanel } from '@/components/IndicatorsPanel'

export default function IndicatorsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Indicadores</h1>
        <IndicatorsPanel />
      </main>
    </div>
  )
} 