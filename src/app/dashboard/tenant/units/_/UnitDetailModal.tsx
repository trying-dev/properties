'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle, Clock, FileUp, History, MessageSquarePlus, Paperclip, Send, X } from 'lucide-react'
import { PaymentStatus, PaymentType, NotificationType } from '+/generated/prisma/enums'
import type { UserTenant } from '+/actions/user'
import type { TenantNotificationItem } from '+/actions/notifications'
import { reportPaymentAction } from '+/actions/payments'
import { sendNotificationAction } from '+/actions/notifications'
import { markNotificationReadAction } from '+/actions/notifications'

type ContractRow = NonNullable<UserTenant['tenant']>['contracts'][number]

const MAX_PROOF_BYTES = 3 * 1024 * 1024 // 3 MB

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  REPORTED: 'Esperando confirmación',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
}

const paymentStatusBadge: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REPORTED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  PARTIAL: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

const paymentTypeLabel: Record<PaymentType, string> = {
  CANON: 'Canon',
  RENT: 'Alquiler',
  DEPOSIT: 'Depósito',
  UTILITIES: 'Servicios',
  MAINTENANCE: 'Mantenimiento',
  REPAIR: 'Reparación',
  LATE_FEE: 'Mora',
  OTHER: 'Otro',
}

const reportable = new Set<PaymentStatus>([PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL])

const money = (v?: number | null) => (v == null ? '-' : `$${v.toLocaleString('es-CO')}`)
const date = (v?: Date | string | null) => (v ? new Date(v).toLocaleDateString('es-CO') : '-')
const monthLabel = (v?: Date | string | null) =>
  v ? new Date(v).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : '-'
const isImage = (url?: string | null) => Boolean(url && (url.startsWith('data:image') || /\.(png|jpe?g|webp|gif)$/i.test(url)))

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

type Tab = 'pago' | 'historial' | 'reportar' | 'notificaciones'

type Props = {
  contract: ContractRow
  notifications: TenantNotificationItem[] // ya filtradas por unidad
  initialTab?: Tab
  onClose: () => void
  onReload: () => Promise<void> | void
}

export default function UnitDetailModal({ contract, notifications, initialTab = 'pago', onClose, onReload }: Props) {
  const unit = contract.unit
  const property = unit?.property
  const [tab, setTab] = useState<Tab>(initialTab)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const payments = useMemo(
    () => [...(contract.payments ?? [])].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    [contract.payments]
  )
  const currentPayment = useMemo(() => {
    const open = payments
      .filter((p) => p.status !== PaymentStatus.PAID && p.status !== PaymentStatus.CANCELLED)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    return open[0] ?? payments[0]
  }, [payments])

  // Comprobante (data URL) que el inquilino adjunta antes de enviar.
  const [proof, setProof] = useState<string | null>(currentPayment?.proofUrl ?? null)
  const [busy, setBusy] = useState(false)

  // Reportar novedad
  const [reportTitle, setReportTitle] = useState('')
  const [reportBody, setReportBody] = useState('')

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PROOF_BYTES) {
      setError('El archivo supera 3 MB')
      return
    }
    setError(null)
    setProof(await fileToDataUrl(file))
  }

  const handleSendProof = async () => {
    if (!currentPayment) return
    setBusy(true)
    setError(null)
    try {
      const result = await reportPaymentAction({ paymentId: currentPayment.id, proofUrl: proof ?? undefined })
      if (!result.success) {
        setError(result.error ?? 'No se pudo enviar el comprobante')
        return
      }
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  const handleSendReport = async () => {
    if (!unit || !reportBody.trim()) return
    setBusy(true)
    setError(null)
    try {
      const result = await sendNotificationAction({
        unitId: unit.id,
        title: reportTitle.trim() || 'Novedad de la unidad',
        body: reportBody.trim(),
        type: NotificationType.TENANT_REPORT,
      })
      if (!result.success) {
        setError(result.error ?? 'No se pudo enviar el reporte')
        return
      }
      setReportTitle('')
      setReportBody('')
      setTab('notificaciones')
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    await markNotificationReadAction(id)
    await onReload()
  }

  const status = currentPayment?.status
  const canReport = status && reportable.has(status)
  const isReported = status === PaymentStatus.REPORTED

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{property?.name ?? 'Unidad'}</h3>
            <p className="text-sm text-gray-500">Unidad {unit?.unitNumber ?? '-'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{contract.status}</span>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2">
          {([
            ['pago', 'Pago', Clock],
            ['historial', 'Historial', History],
            ['reportar', 'Reportar', MessageSquarePlus],
            ['notificaciones', 'Notis', Bell],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${
                tab === key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {key === 'notificaciones' && notifications.some((n) => !n.readAt) && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {notifications.filter((n) => !n.readAt).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          {/* ── PAGO ACTUAL ── */}
          {tab === 'pago' &&
            (!currentPayment ? (
              <p className="text-sm text-gray-500">No hay pagos registrados.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Pago actual</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusBadge[currentPayment.status]}`}>
                      {paymentStatusLabel[currentPayment.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{money(currentPayment.amount)}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-400">Mes</dt>
                      <dd className="font-medium text-gray-800">{monthLabel(currentPayment.dueDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Próximo vencimiento</dt>
                      <dd className="font-medium text-gray-800">{date(currentPayment.dueDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Desde (contrato)</dt>
                      <dd className="font-medium text-gray-800">{date(contract.startDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Concepto</dt>
                      <dd className="font-medium text-gray-800">{paymentTypeLabel[currentPayment.paymentType]}</dd>
                    </div>
                  </dl>
                </div>

                {currentPayment.status === PaymentStatus.PAID ? (
                  <p className="text-sm text-green-700">Pagado el {date(currentPayment.paidDate)}.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Enviar confirmación de pago</p>
                    {isReported && (
                      <p className="text-xs text-blue-600">
                        Reportado{currentPayment.reportedAt ? ` el ${date(currentPayment.reportedAt)}` : ''} · esperando confirmación de la administración. Puedes editar el comprobante hasta que lo confirmen.
                      </p>
                    )}

                    {/* Comprobante adjunto */}
                    {proof ? (
                      <div className="rounded-lg border border-gray-200 p-3">
                        {isImage(proof) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={proof} alt="Comprobante" className="max-h-48 w-full rounded object-contain" />
                        ) : (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Paperclip className="h-4 w-4" /> Comprobante adjunto
                          </p>
                        )}
                        <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
                          Cambiar comprobante
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-3 py-6 text-sm font-semibold text-gray-500 hover:border-blue-300 hover:text-blue-600"
                      >
                        <FileUp className="h-5 w-5" />
                        Adjuntar comprobante (imagen o PDF)
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handlePickFile} />

                    <button
                      type="button"
                      onClick={handleSendProof}
                      disabled={busy || (!proof && !canReport)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {busy ? 'Enviando…' : isReported ? 'Actualizar comprobante' : 'Enviar confirmación de pago'}
                    </button>
                  </div>
                )}
              </div>
            ))}

          {/* ── HISTORIAL ── */}
          {tab === 'historial' && (
            <div className="overflow-x-auto">
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">Sin pagos.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                      <th className="py-2 pr-3">Concepto</th>
                      <th className="py-2 pr-3">Vence</th>
                      <th className="py-2 pr-3">Monto</th>
                      <th className="py-2 pr-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="text-gray-700">
                        <td className="py-2 pr-3 font-medium text-gray-900">{paymentTypeLabel[p.paymentType]}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{date(p.dueDate)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{money(p.amount)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusBadge[p.status]}`}>
                            {paymentStatusLabel[p.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── REPORTAR ── */}
          {tab === 'reportar' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Envía una novedad al administrador de tu unidad.</p>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Asunto (ej. Fuga en el baño)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                value={reportBody}
                onChange={(e) => setReportBody(e.target.value)}
                rows={4}
                placeholder="Describe la novedad…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleSendReport}
                disabled={busy || !reportBody.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {busy ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          )}

          {/* ── NOTIFICACIONES ── */}
          {tab === 'notificaciones' && (
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">Sin notificaciones de esta unidad.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`rounded-lg border p-3 ${n.readAt ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{n.title ?? 'Notificación'}</p>
                      {!n.readAt && (
                        <button type="button" onClick={() => handleMarkRead(n.id)} className="text-xs font-semibold text-blue-600 hover:underline">
                          Marcar leída
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{n.body}</p>
                    <p className="mt-1 text-xs text-gray-400">{date(n.createdAt)}</p>
                  </div>
                ))
              )}
              <Link href="/dashboard/tenant/notifications" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                <CheckCircle className="h-4 w-4" /> Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
