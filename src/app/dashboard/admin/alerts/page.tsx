'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BellRing, FileText, Gauge, Receipt, ShieldAlert, ShieldCheck, Wrench } from 'lucide-react'

import Header from '+/components/Header'
import { getUpcomingExpirations, type ExpirationItem } from '+/actions/alerts'

const sourceMeta: Record<
  ExpirationItem['source'],
  { label: string; icon: typeof BellRing; href: string }
> = {
  POLICY: { label: 'Póliza', icon: ShieldCheck, href: '/dashboard/admin/insurance' },
  SECURITY: { label: 'Seguridad', icon: ShieldAlert, href: '/dashboard/admin/security' },
  DOCUMENT: { label: 'Documento', icon: FileText, href: '/dashboard/admin/documents' },
  MAINTENANCE: { label: 'Mantenimiento', icon: Wrench, href: '/dashboard/admin/maintenance' },
  TAX: { label: 'Predial', icon: Receipt, href: '/dashboard/admin/property-tax' },
}

const formatDate = (value: Date | string) => new Date(value).toLocaleDateString('es-CO')

const daysStyle = (days: number) =>
  days < 0 ? 'bg-red-100 text-red-700' : days <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'

const daysLabel = (days: number) => (days < 0 ? `venció hace ${Math.abs(days)} d` : days === 0 ? 'vence hoy' : `en ${days} d`)

export default function AdminAlertsPage() {
  const [items, setItems] = useState<ExpirationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setItems(await getUpcomingExpirations(30))
      } catch (err) {
        console.error('Error loading alerts:', err)
        setError('No se pudieron cargar las alertas')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const overdue = useMemo(() => items.filter((i) => i.daysLeft < 0).length, [items])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Alertas y vencimientos</h1>
        <p className="text-sm text-gray-500 mb-6">
          Pólizas, servicios de seguridad, documentos, mantenimientos preventivos y predial que vencen en los próximos 30 días. El cron diario notifica a los administradores.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {isLoading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin vencimientos próximos. Todo al día. 🎉</p>
        ) : (
          <>
            {overdue > 0 && (
              <p className="text-sm text-red-600 mb-4 font-medium">
                {overdue} {overdue === 1 ? 'ítem vencido' : 'ítems vencidos'}.
              </p>
            )}
            <div className="space-y-2">
              {items.map((item) => {
                const meta = sourceMeta[item.source]
                const Icon = meta.icon
                return (
                  <Link
                    key={`${item.source}-${item.id}`}
                    href={meta.href}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.title} · {item.propertyName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {meta.label} · {item.detail} · {formatDate(item.date)}
                      </p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center text-xs font-semibold px-2.5 py-1 rounded-full ${daysStyle(item.daysLeft)}`}>
                      {daysLabel(item.daysLeft)}
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
