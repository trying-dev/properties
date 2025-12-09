import Link from 'next/link'
import { Home } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 flex items-center justify-center rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Properties</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/propiedades" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Buscar
            </Link>
            <Link href="/sobre-nosotros" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sobre Nosotros
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Registrarse
            </Link>
            <Link
              href="/auth"
              className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
