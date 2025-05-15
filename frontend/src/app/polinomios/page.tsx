import { Navigation } from '@/components/Navigation'
import { PolynomialForm } from '@/components/PolynomialForm'

export default function PolynomialsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Polinômios de Correção</h1>
        <PolynomialForm />
      </main>
    </div>
  )
} 