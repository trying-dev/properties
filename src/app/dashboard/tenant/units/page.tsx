'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Bell, Building2, History, Home, Info, MessageSquare, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

// Las imágenes de la unidad se guardan como JSON string de URLs.
const parseImages = (images?: string | null): string[] => {
  if (!images) return []
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}
import { PaymentStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { getUserTenant, type UserTenant } from '+/actions/user'
import { getTenantNotificationsAction, type TenantNotificationItem } from '+/actions/notifications'
import UnitDetailModal from './_/UnitDetailModal'

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

type ContractRow = NonNullable<UserTenant['tenant']>['contracts'][0]

const pendingStatuses = new Set<PaymentStatus>([PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL])

type CurrentPayment = { status: PaymentStatus; dueDate: Date | string } | undefined

// Chip de color por estado (acento, no fondo completo).
const chipClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
}

// Estado del alquiler derivado del pago actual (para el banner de la tarjeta).
const rentalStatus = (cp: CurrentPayment) => {
  if (!cp) return { label: 'Sin pagos', tone: 'gray', icon: Clock, dateLabel: 'Próximo pago', date: null as Date | string | null, sub: '' }
  const days = Math.ceil((new Date(cp.dueDate).getTime() - Date.now()) / 86_400_000)
  if (cp.status === PaymentStatus.PAID) return { label: 'Al día', tone: 'green', icon: CheckCircle, dateLabel: 'Próximo pago', date: cp.dueDate, sub: '' }
  if (cp.status === PaymentStatus.REPORTED) return { label: 'Esperando confirmación', tone: 'blue', icon: Clock, dateLabel: 'Próximo pago', date: cp.dueDate, sub: 'En revisión' }
  if (days < 0) return { label: 'Atrasado', tone: 'red', icon: AlertTriangle, dateLabel: 'Vencimiento', date: cp.dueDate, sub: `${-days} días de retraso` }
  if (days <= 7) return { label: 'Vence pronto', tone: 'amber', icon: Clock, dateLabel: 'Próximo pago', date: cp.dueDate, sub: days === 0 ? 'Vence hoy' : `Vence en ${days} días` }
  return { label: 'Al día', tone: 'green', icon: CheckCircle, dateLabel: 'Próximo pago', date: cp.dueDate, sub: '' }
}

export default function TenantUnitsPage() {
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [notifications, setNotifications] = useState<TenantNotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Modal de detalle de la unidad (pago/historial/reportar/notificaciones)
  const [detailContractId, setDetailContractId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<'pago' | 'historial' | 'reportar' | 'notificaciones'>('pago')

  const openDetail = (contractId: string, tab: 'pago' | 'historial' | 'reportar' | 'notificaciones' = 'pago') => {
    setDetailTab(tab)
    setDetailContractId(contractId)
  }

  const loadContracts = async () => {
    const [user, notifResult] = await Promise.all([getUserTenant(), getTenantNotificationsAction()])
    setContracts(user?.tenant?.contracts ?? [])
    setNotifications(notifResult.success && notifResult.data ? notifResult.data : [])
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadContracts()
      } catch (err) {
        console.error('Error loading tenant units:', err)
        setError('No se pudieron cargar las unidades')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const contractCards = useMemo(() => {
    return contracts.map((contract) => {
      const unit = contract.unit
      const property = unit?.property
      const address = property
        ? `${property.street ?? ''} ${property.number ?? ''}, ${property.neighborhood ?? ''}, ${property.city ?? ''}`.trim()
        : 'Dirección no disponible'

      const payments = [...(contract.payments ?? [])].sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )
      const latestPayment = payments[0]
      const pendingCount = payments.filter((payment) => pendingStatuses.has(payment.status)).length

      // Pago actual = la cuota abierta más próxima a vencer (o la más antigua vencida);
      // si todo está pagado, el último pago.
      const openPayments = payments
        .filter((p) => p.status !== PaymentStatus.PAID && p.status !== PaymentStatus.CANCELLED)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      const currentPayment = openPayments[0] ?? latestPayment

      // Último pago confirmado (para "Último pago").
      const lastPaid = payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .sort((a, b) => new Date(b.paidDate ?? b.dueDate).getTime() - new Date(a.paidDate ?? a.dueDate).getTime())[0]

      const unitNotifs = unit ? notifications.filter((n) => n.unitId === unit.id) : []
      const unitUnread = unitNotifs.filter((n) => !n.readAt).length

      return {
        contract,
        unit,
        property,
        address,
        latestPayment,
        currentPayment,
        lastPaid,
        payments,
        pendingCount,
        unitNotifs,
        unitUnread,
      }
    })
  }, [contracts, notifications])

  const detailCard = contractCards.find((c) => c.contract.id === detailContractId) ?? null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/tenant" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unidades en arriendo</h1>
            <p className="text-gray-600">Tus contratos y estado de pagos asociados.</p>
          </div>
          <span className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">{contracts.length}</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando unidades...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : contractCards.length === 0 ? (
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes unidades alquiladas</h3>
            <p className="text-gray-600 mb-6">Explora nuestro catálogo y encuentra tu próximo hogar</p>
            <Link
              href="/propiedades"
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>Buscar Propiedades</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {contractCards.map(({ contract, unit, property, address, currentPayment, lastPaid, unitUnread }) => {
              const cover = parseImages(unit?.images)[0]

              return (
                <div
                  key={contract.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Portada */}
                  <div className="relative aspect-video w-full bg-gray-100">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={property?.name ?? 'Unidad'}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                        <Building2 className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      Unidad {unit?.unitNumber ?? '-'}
                    </span>
                  </div>

                  {/* Cuerpo */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate">{property?.name ?? 'Unidad'}</h3>
                        <p className="text-sm text-gray-500 truncate">{address}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Alquiler</p>
                        <p className="font-semibold text-gray-900">{formatMoney(contract.rent)}</p>
                      </div>
                    </div>

                    {(() => {
                      const s = rentalStatus(currentPayment)
                      const st = currentPayment?.status
                      const isReportable = st === PaymentStatus.PENDING || st === PaymentStatus.OVERDUE || st === PaymentStatus.PARTIAL
                      const isReported = st === PaymentStatus.REPORTED
                      return (
                        <>
                          {/* Detalle */}
                          <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Contrato desde</dt>
                              <dd className="font-medium text-gray-800">{formatDate(contract.startDate)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Último pago</dt>
                              <dd className="font-medium text-gray-800">{lastPaid ? formatDate(lastPaid.paidDate ?? lastPaid.dueDate) : '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Próximo pago</dt>
                              <dd className="font-medium text-gray-800">{currentPayment ? formatDate(currentPayment.dueDate) : '-'}</dd>
                            </div>
                            <div className="flex items-center justify-between">
                              <dt className="text-gray-500">Estado pago actual</dt>
                              <dd className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openDetail(contract.id, 'pago')}
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold hover:opacity-80 ${chipClasses[s.tone]}`}
                                >
                                  {s.label}
                                  {s.sub ? ` · ${s.sub}` : ''}
                                </button>
                                <span className="group relative inline-flex">
                                  <Info className="h-4 w-4 cursor-help text-gray-400" />
                                  <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium leading-snug text-white shadow-lg group-hover:block">
                                    {isReported
                                      ? 'Da click al estado para ver la confirmación o editar el comprobante que enviaste.'
                                      : isReportable
                                        ? 'Da click al estado para subir el comprobante y confirmar el pago.'
                                        : 'Da click al estado para ver el detalle del pago.'}
                                  </span>
                                </span>
                              </dd>
                            </div>
                          </dl>
                        </>
                      )
                    })()}

                    {/* Acciones */}
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-4 text-sm font-semibold">
                      <button type="button" onClick={() => openDetail(contract.id, 'historial')} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-gray-900">
                        <History className="h-4 w-4" /> Historia de pagos
                      </button>
                      <button type="button" onClick={() => openDetail(contract.id, 'reportar')} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-gray-900">
                        <MessageSquare className="h-4 w-4" /> Empezar comunicación
                      </button>
                      <button type="button" onClick={() => openDetail(contract.id, 'notificaciones')} className="relative inline-flex items-center gap-1.5 text-gray-700 hover:text-gray-900">
                        <Bell className="h-4 w-4" /> Notificaciones
                        {unitUnread > 0 && (
                          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unitUnread}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {detailCard && (
        <UnitDetailModal
          contract={detailCard.contract}
          notifications={detailCard.unitNotifs}
          initialTab={detailTab}
          onClose={() => setDetailContractId(null)}
          onReload={loadContracts}
        />
      )}

      <Footer />
    </div>
  )
}
