'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AccessRequestKind, AccessRequestStatus, PackageStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { cancelAccessRequestAction, createAccessRequestAction, getTenantAccessContextAction, type TenantAccessData } from '+/actions/access'
import { accessKindLabel, accessStatusConfig, packageStatusLabel } from '+/lib/accessLabels'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'
const formatDateTime = (value?: Date | string | null) => (value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '-')

export default function TenantAccessPage() {
  const [data, setData] = useState<TenantAccessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [form, setForm] = useState({
    unitId: '',
    kind: AccessRequestKind.VISIT as AccessRequestKind,
    personName: '',
    personId: '',
    details: '',
    scheduledAt: '',
    untilAt: '',
  })

  const load = useCallback(async () => {
    const result = await getTenantAccessContextAction()
    if (result.success && result.data) {
      setData(result.data)
      setForm((current) => ({ ...current, unitId: current.unitId || result.data!.units[0]?.id || '' }))
    } else setError(result.error ?? 'No se pudo cargar la información')
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load])

  const needsPerson = form.kind === AccessRequestKind.VISIT || form.kind === AccessRequestKind.CONTRACTOR

  const send = async () => {
    setIsSending(true)
    setError(null)
    setNotice(null)
    const result = await createAccessRequestAction({ ...form, untilAt: form.untilAt || null })
    setIsSending(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo registrar')
      return
    }
    setNotice(result.data?.autoApproved ? 'Visita registrada' : 'Solicitud enviada al administrador')
    setForm((current) => ({ ...current, personName: '', personId: '', details: '', scheduledAt: '', untilAt: '' }))
    await load()
  }

  const cancel = async (requestId: string) => {
    await cancelAccessRequestAction(requestId)
    await load()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/tenant" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Accesos y paquetería</h1>
        <p className="mt-2 text-gray-600">Registra visitantes, pide autorizaciones y revisa los paquetes que llegaron a administración.</p>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

        {!loading && data && (
          <div className="mt-8 space-y-8">
            {data.units.length > 0 ? (
              <section className="space-y-4 rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Nueva solicitud</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className={inputClass}>
                    {data.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as AccessRequestKind })} className={inputClass}>
                    {Object.entries(accessKindLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {needsPerson && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })} placeholder="Nombre de la persona" className={inputClass} />
                    <input value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })} placeholder="Documento (opcional)" className={inputClass} />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs uppercase tracking-wide text-gray-400">
                    Desde
                    <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={`${inputClass} mt-1 normal-case`} />
                  </label>
                  <label className="text-xs uppercase tracking-wide text-gray-400">
                    Hasta (opcional)
                    <input type="datetime-local" value={form.untilAt} onChange={(e) => setForm({ ...form, untilAt: e.target.value })} className={`${inputClass} mt-1 normal-case`} />
                  </label>
                </div>
                <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={3} placeholder="Detalle de lo que se hará o motivo" className={inputClass} />
                <button
                  onClick={send}
                  disabled={isSending || !form.unitId || !form.scheduledAt || !form.details.trim()}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSending ? 'Enviando…' : form.kind === AccessRequestKind.VISIT ? 'Registrar visita' : 'Solicitar autorización'}
                </button>
              </section>
            ) : (
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Tus propiedades aún no tienen habilitado el control de accesos.
              </p>
            )}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Mis solicitudes</h2>
              {data.requests.length === 0 ? (
                <p className="text-sm text-gray-600">Sin solicitudes.</p>
              ) : (
                data.requests.map((item) => {
                  const status = accessStatusConfig[item.status]
                  const cancellable = item.status === AccessRequestStatus.PENDING || item.status === AccessRequestStatus.APPROVED
                  return (
                    <article key={item.id} className="space-y-1 rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {accessKindLabel[item.kind]}
                          {item.personName ? ` · ${item.personName}` : ''}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.box}`}>{status.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.details}</p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(item.scheduledAt)}
                        {item.untilAt ? ` a ${formatDateTime(item.untilAt)}` : ''} · {item.property.name}
                        {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''}
                      </p>
                      {item.decisionNote && <p className="text-sm text-gray-700">Administración. {item.decisionNote}</p>}
                      {cancellable && (
                        <button onClick={() => cancel(item.id)} className="text-xs font-semibold text-red-700 hover:underline">
                          Cancelar
                        </button>
                      )}
                    </article>
                  )
                })
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Paquetería</h2>
              {data.packages.length === 0 ? (
                <p className="text-sm text-gray-600">Sin paquetes registrados.</p>
              ) : (
                data.packages.map((item) => (
                  <article key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-400">
                        {item.carrier ? `${item.carrier} · ` : ''}Recibido {formatDateTime(item.receivedAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === PackageStatus.RECEIVED ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {packageStatusLabel[item.status]}
                    </span>
                  </article>
                ))
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
