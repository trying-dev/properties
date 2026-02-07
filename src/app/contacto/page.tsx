import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, ArrowRight, MessageSquare } from 'lucide-react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

const contactMethods = [
  {
    title: 'Correo electrónico',
    value: 'soporte@tuempresa.com',
    detail: 'Te respondemos en menos de 24 horas hábiles',
    icon: Mail,
    href: 'mailto:soporte@tuempresa.com',
  },
  {
    title: 'Teléfono',
    value: '+57 300 123 4567',
    detail: 'Lunes a viernes, 8:00 AM - 6:00 PM',
    icon: Phone,
    href: 'tel:+573001234567',
  },
  {
    title: 'Ubicación',
    value: 'Bgota D.C.',
    detail: 'Bgota D.C.',
    icon: MapPin,
    href: null,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">Contacto</p>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">¿En qué podemos ayudarte?</h1>
          <p className="text-xl text-gray-600 mt-6 leading-relaxed">
            Ya sea que estés buscando tu próximo hogar, gestionando una propiedad, o tengas dudas sobre nuestro proceso, estamos aquí para orientarte.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method) => (
            <div key={method.title} className="group">
              {method.href ? (
                <a href={method.href} className="block h-full p-6 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors">
                  <method.icon className="h-6 w-6 text-gray-900 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">{method.title}</p>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{method.value}</p>
                  <p className="text-sm text-gray-600">{method.detail}</p>
                </a>
              ) : (
                <div className="h-full p-6 border border-gray-200 rounded-lg">
                  <method.icon className="h-6 w-6 text-gray-900 mb-4" />
                  <p className="text-sm text-gray-600 mb-1">{method.title}</p>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{method.value}</p>
                  <p className="text-sm text-gray-600">{method.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - For Tenants */}
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">¿Ya tienes cuenta?</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Si eres inquilino o estás en proceso de aplicación, usa el sistema de mensajes desde tu dashboard para recibir soporte directo de
                    tu administrador.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Ir a mensajes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Buscar unidades
                </Link>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preguntas frecuentes</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-1">¿Cuánto tiempo toma el proceso?</p>
                  <p className="text-sm text-gray-600">
                    La revisión de documentos toma 24-48 horas. Una vez aprobado, puedes firmar el contrato digitalmente en minutos.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">¿Qué documentos necesito?</p>
                  <p className="text-sm text-gray-600">
                    Documento de identidad, certificados de ingresos, extractos bancarios de los últimos 3 meses y referencias personales y laborales.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">¿Cobran comisión?</p>
                  <p className="text-sm text-gray-600">Los costos se definen claramente al inicio del proceso. Sin sorpresas ni cargos ocultos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="border border-gray-200 rounded-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Envíanos un mensaje</h2>
              <p className="text-gray-600 mb-6">Déjanos tus datos y un asesor se pondrá en contacto contigo.</p>

              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                    ¿En qué podemos ayudarte?
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    placeholder="Cuéntanos sobre tu búsqueda o consulta..."
                  />
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Enviar mensaje
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Al enviar este formulario, aceptas nuestra{' '}
                  <Link href="/politica-privacidad" className="underline hover:text-gray-900">
                    política de privacidad
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">¿Prefieres hablar directamente?</h2>
            <p className="text-gray-600 mb-6">Llámanos o escríbenos por WhatsApp durante nuestro horario de atención.</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:+573001234567"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <Phone className="h-4 w-4" />
                +57 300 123 4567
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Lun - Vie, 8:00 AM - 6:00 PM
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
