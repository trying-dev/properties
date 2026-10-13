import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import Header from '+/components/Header'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'

const linkClass = 'text-sm font-semibold text-blue-700 hover:underline'

export default async function FormatsPage() {
  const scope = await getCurrentAdminScope()
  if (!scope) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <p className="text-red-600">Solo administradores.</p>
        </main>
      </div>
    )
  }

  const propertyFilter = propertyAccessFilter(scope)
  const [contracts, maintenances, cases] = await Promise.all([
    prisma.contract.findMany({
      where: { status: { in: ['ACTIVE', 'PENDING', 'TERMINATED', 'EXPIRED'] }, unit: { property: propertyFilter } },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      select: {
        id: true,
        status: true,
        unit: { select: { unitNumber: true, property: { select: { name: true } } } },
        tenant: { select: { user: { select: { name: true, lastName: true } } } },
      },
    }),
    prisma.maintenance.findMany({
      where: { type: { in: ['CORRECTIVE', 'INCIDENT'] }, unit: { property: propertyFilter } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, title: true, createdAt: true, unit: { select: { unitNumber: true, property: { select: { name: true } } } } },
    }),
    prisma.tenantCase.findMany({
      where: { property: propertyFilter },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, number: true, subject: true, property: { select: { name: true } } },
    }),
  ])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Formatos</h1>
        <p className="mt-2 text-gray-600">Documentos del Tomo X generados con los datos que ya están en la plataforma. Se abren listos para imprimir o guardar como PDF.</p>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Acta de entrega (F-016) y acta de devolución (F-017)</h2>
          {contracts.length === 0 && <p className="text-sm text-gray-600">Sin contratos.</p>}
          {contracts.map((contract) => (
            <div key={contract.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-800">
                {contract.unit.property.name} · Unidad {contract.unit.unitNumber} ·{' '}
                {[contract.tenant.user.name, contract.tenant.user.lastName].filter(Boolean).join(' ')}
              </p>
              <div className="flex gap-4">
                <Link href={`/dashboard/admin/formats/acta/${contract.id}`} className={linkClass}>
                  Entrega
                </Link>
                <Link href={`/dashboard/admin/formats/acta/${contract.id}?tipo=devolucion`} className={linkClass}>
                  Devolución
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Reporte de daños (F-058)</h2>
          {maintenances.length === 0 && <p className="text-sm text-gray-600">Sin mantenimientos correctivos ni incidentes.</p>}
          {maintenances.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-800">
                {item.title} · {item.unit.property.name} · Unidad {item.unit.unitNumber}
              </p>
              <Link href={`/dashboard/admin/formats/reporte-danos/${item.id}`} className={linkClass}>
                Abrir
              </Link>
            </div>
          ))}
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Radicación de PQRS (F-091)</h2>
          {cases.length === 0 && <p className="text-sm text-gray-600">Sin casos radicados.</p>}
          {cases.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-800">
                {item.number} · {item.subject} · {item.property.name}
              </p>
              <Link href={`/dashboard/admin/formats/radicacion-pqrs/${item.id}`} className={linkClass}>
                Abrir
              </Link>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
