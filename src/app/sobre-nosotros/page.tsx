import Link from 'next/link'
import { Building2, ShieldCheck, Sparkles, Users, Target, HeartHandshake, ArrowRight } from 'lucide-react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

const values = [
  {
    title: 'Transparencia',
    description: 'Información clara en cada paso del proceso, sin costos ocultos.',
    icon: ShieldCheck,
  },
  {
    title: 'Cercanía',
    description: 'Acompañamiento humano para inquilinos y propietarios.',
    icon: HeartHandshake,
  },
  {
    title: 'Eficiencia',
    description: 'Procesos digitales que reducen tiempos y errores.',
    icon: Sparkles,
  },
  {
    title: 'Confianza',
    description: 'Decisiones respaldadas por datos y verificación.',
    icon: Users,
  },
]

const steps = [
  {
    title: 'Diagnóstico del inmueble',
    description: 'Levantamos la información y definimos el perfil ideal de inquilino.',
  },
  {
    title: 'Selección y validación',
    description: 'Verificamos antecedentes y documentación para reducir riesgos.',
  },
  {
    title: 'Acompañamiento continuo',
    description: 'Seguimiento de pagos, soporte y mejoras del contrato.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex flex-col">
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
                  Sobre nosotros
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 leading-tight">
                  Hacemos que alquilar sea simple, seguro y humano.
                </h1>
                <p className="text-lg text-gray-600 mt-4">
                  Somos un equipo dedicado a conectar propietarios con inquilinos confiables, con procesos claros y acompañamiento real.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/propiedades"
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-5 py-3 text-sm font-semibold hover:bg-gray-800"
                  >
                    Ver propiedades
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Ir al dashboard
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <Building2 className="h-6 w-6 text-gray-800" />
                  <p className="text-sm text-gray-500 mt-3">Portafolio en crecimiento</p>
                  <p className="text-lg font-semibold text-gray-900">Propiedades verificadas</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <Target className="h-6 w-6 text-gray-800" />
                  <p className="text-sm text-gray-500 mt-3">Procesos ágiles</p>
                  <p className="text-lg font-semibold text-gray-900">Decisiones basadas en datos</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <Users className="h-6 w-6 text-gray-800" />
                  <p className="text-sm text-gray-500 mt-3">Equipo multidisciplinario</p>
                  <p className="text-lg font-semibold text-gray-900">Soporte cercano</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-gray-800" />
                  <p className="text-sm text-gray-500 mt-3">Seguridad</p>
                  <p className="text-lg font-semibold text-gray-900">Validaciones confiables</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Nuestra misión</h2>
              <p className="text-gray-600">
                Facilitar acuerdos de arriendo justos y seguros, conectando a las personas adecuadas con el hogar ideal mediante tecnología y asesoría experta.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Nuestra visión</h2>
              <p className="text-gray-600">
                Ser el aliado más confiable en la gestión de arriendos, con una experiencia transparente que proteja tanto a propietarios como a inquilinos.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="text-2xl font-bold text-gray-900">Cómo trabajamos</h2>
            <p className="text-gray-600 mt-2">Un proceso simple para tomar decisiones rápidas y seguras.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {steps.map((step) => (
                <div key={step.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold text-gray-900">Nuestros valores</h2>
          <p className="text-gray-600 mt-2">Principios que guían cada relación y cada decisión.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <value.icon className="h-6 w-6 text-gray-800" />
                <h3 className="text-lg font-semibold text-gray-900 mt-4">{value.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">¿Quieres conocer más?</h2>
                <p className="text-gray-600 mt-2">Hablemos sobre tu propiedad o encuentra el hogar que buscas.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/propiedades"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-5 py-3 text-sm font-semibold hover:bg-gray-800"
                >
                  Buscar propiedades
                </Link>
                <Link
                  href="/dashboard/tenant/mensajes"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Contactar soporte
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
