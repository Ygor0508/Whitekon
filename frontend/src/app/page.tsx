import { Navigation } from '@/components/Navigation'
import { ConnectionForm } from '@/components/ConnectionForm'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Configuração de Conexão</h1>
        <ConnectionForm />
      </main>
    </div>
  )
}
