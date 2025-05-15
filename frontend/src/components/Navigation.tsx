'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Conexão', path: '/' },
  { name: 'Calibração', path: '/calibracao' },
  { name: 'Polinômios', path: '/polinomios' },
  { name: 'Indicadores', path: '/indicadores' },
  { name: 'Monitoramento', path: '/monitoramento' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 bg-white shadow-sm p-4">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === item.path
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
} 