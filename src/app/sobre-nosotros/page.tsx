import Link from 'next/link'
import { Building2, ShieldCheck, Sparkles, Users, Target, HeartHandshake, ArrowRight } from 'lucide-react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

const values = [
  {
    title: 'Transparencia total',
    description: 'Información clara en cada paso. Cero costos ocultos, cero sorpresas.',
    icon: ShieldCheck,
  },
  {
    title: 'Cercanía humana',
    description: 'Personas reales que entienden tu situación y responden cuando lo necesitas.',
    icon: HeartHandshake,
  },
  {
    title: 'Procesos simples',
    description: 'Tecnología que funciona para ti, no contra ti. Menos trámites, más claridad.',
    icon: Sparkles,
  },
  {
    title: 'Decisiones informadas',
    description: 'Verificaciones reales que protegen a propietarios e inquilinos por igual.',
    icon: Users,
  },
]

const howItWorks = [
  {
    number: '01',
    title: 'Publicar o buscar',
    description: 'Propietarios publican sus unidades con información completa. Inquilinos buscan con filtros precisos.',
  },
  {
    number: '02',
    title: 'Verificación seria',
    description: 'Validamos documentos, ingresos y referencias. No hay atajos ni improvisaciones.',
  },
  {
    number: '03',
    title: 'Firma digital',
    description: 'Contratos claros, firmados en minutos. Todo registrado, todo respaldado.',
  },
  {
    number: '04',
    title: 'Gestión continua',
    description: 'Seguimiento de pagos, soporte cuando surgen problemas, renovaciones sin complicaciones.',
  },
]

const highlights = ['Tecnología que facilita tu vida', 'Personas reales que te orientan', 'Procesos claros y rápidos']

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-linear-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-4">Sobre nosotros</p>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">Alquilar debería ser simple.</h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Conectamos propietarios con inquilinos confiables a través de procesos claros, verificaciones reales y tecnología que funciona. Nos
                orientamos a lo digital para facilitarte la vida, pero estamos siempre disponibles para orientarte en lo que necesites.
              </p>

              <div className="mt-8 space-y-3">
                {highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                    <p className="text-gray-700 font-medium">{highlight}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Ver unidades disponibles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-900 text-white mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra misión</h2>
              <p className="text-gray-600 leading-relaxed">
                Facilitar acuerdos de arriendo justos y seguros, conectando a las personas adecuadas con la unidad ideal mediante tecnología
                transparente y verificaciones confiables. Queremos que tanto propietarios como inquilinos se sientan protegidos y respaldados en cada
                paso.
              </p>
            </div>

            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-900 mb-6">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra visión</h2>
              <p className="text-gray-600 leading-relaxed">
                Convertirnos en la plataforma más confiable para gestión de arriendos en Colombia, donde cada contrato se basa en información
                verificada, cada proceso es transparente, y cada persona involucrada recibe el soporte que merece.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Cómo funciona</h2>
              <p className="text-lg text-gray-600">Un proceso diseñado para ser rápido y seguro, sin pasos innecesarios.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {howItWorks.map((step) => (
                <div key={step.number} className="relative">
                  <div className="absolute top-0 left-0 text-7xl font-bold text-gray-100 -z-10">{step.number}</div>
                  <div className="pt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que nos define</h2>
            <p className="text-lg text-gray-600">Principios que guían cada decisión y cada interacción.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.title} className="group">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                    <value.icon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What We Are */}
        <section className="bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-6">Esto es lo que somos</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Tu aliado en cada paso</h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Desde la primera búsqueda hasta la renovación del contrato, estamos contigo. Personas reales que entienden tu situación y
                      responden cuando lo necesitas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Verificación que protege a todos</h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Validamos documentos, ingresos y referencias para que tanto propietarios como inquilinos tengan tranquilidad. Información real,
                      decisiones informadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Tecnología al servicio de las personas</h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Automatizamos lo tedioso para que te enfoques en lo importante. Contratos digitales, seguimiento de pagos, notificaciones
                      oportunas. Todo funciona para hacerte la vida más fácil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Tienes una propiedad para arrendar?</h2>
              <p className="text-lg text-gray-600 mb-8">
                O tal vez estás buscando el lugar ideal. Sea cual sea tu caso, podemos ayudarte con un proceso claro y respaldo real.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Buscar unidades
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-white transition-colors"
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
