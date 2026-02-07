import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, ArrowRight, MessageSquare } from 'lucide-react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

const contactCards = [
  {
    title: 'Correo',
    description: 'Respuesta en 24 horas hábiles.',
    value: 'info@properties.com',
    icon: Mail,
  },
  {
    title: 'Teléfono',
    description: 'Atención de lunes a viernes.',
    value: '+57 300 123 4567',
    icon: Phone,
  },
  {
    title: 'Horario',
    description: 'Lun - Vie',
    value: '8:00 AM - 6:00 PM',
    icon: Clock,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
              Contacto
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mt-4">Hablemos sobre tu próximo hogar</h1>
            <p className="text-lg text-gray-600 mt-4">
              Estamos listos para ayudarte con tu búsqueda de propiedad o para acompañarte en la gestión de tu inmueble.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {contactCards.map((card) => (
                <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <card.icon className="h-5 w-5 text-gray-800" />
                  <p className="text-sm text-gray-500 mt-3">{card.title}</p>
                  <p className="text-sm font-semibold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-700" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">¿Eres inquilino?</h2>
                  <p className="text-sm text-gray-600">Escríbenos desde tu dashboard para soporte directo.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/tenant/mensajes"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
                >
                  Ir a mensajes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/propiedades"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Buscar propiedades
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Visítanos</h2>
              <p className="text-sm text-gray-600 mt-2">Oficina principal en Medellín, Colombia.</p>
              <div className="mt-4 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cra 43A # 18 - 110</p>
                  <p className="text-sm text-gray-600">El Poblado, Medellín</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Formulario rápido</h2>
              <p className="text-sm text-gray-600 mt-2">Déjanos tus datos y un asesor te contactará.</p>
              <form className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Cuéntanos en qué te ayudamos"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[120px]"
                />
                <button type="button" className="w-full rounded-lg bg-gray-900 text-white py-2 text-sm font-semibold hover:bg-gray-800">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
