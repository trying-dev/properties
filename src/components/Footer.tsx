import Link from 'next/link'
import { Home } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center rounded-lg">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Properties</span>
            </div>
            <p className="text-sm text-gray-600">Encuentra tu próximo hogar con nosotros</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Explorar</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Buscar propiedades
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: info@properties.com</li>
              <li>Tel: +57 300 123 4567</li>
              <li>Lun - Vie: 8AM - 6PM</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2025 Properties. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
