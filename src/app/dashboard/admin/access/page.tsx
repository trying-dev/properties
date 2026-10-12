'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AccessDeviceKind, AccessDeviceStatus, AccessRequestStatus, PackageStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  decideAccessRequestAction,
  getAdminAccessDataAction,
  markPackageDeliveredAction,
  registerKeyAction,
  registerPackageAction,
  updateKeyStatusAction,
  type AdminAccessData,
} from '+/actions/access'
import { accessKindLabel, accessStatusConfig, deviceKindLabel, deviceStatusLabel, packageStatusLabel } from '+/lib/accessLabels'

type Tab = 'solicitudes' | 'paqueteria' | 'llaves'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'
const formatDateTime = (value?: Date | string | null) => (value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '-')
const buttonClass = 'rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50'

export default function AdminAccessPage() {
  const [data, setData] = useState<AdminAccessData | null>(null)
  const [tab, setTab] = useState<Tab>('solicitudes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [pkg, setPkg] = useState({ unitId: '', description: '', carrier: '' })
  const [key, setKey] = useState({ unitId: '', kind: AccessDeviceKind.KEY as AccessDeviceKind, label: '', quantity: '1', holder: '', notes: '' })

  const load = useCallback(async () => {
    const result = await getAdminAccessDataAction()
    if (result.success && result.data) setData(result.data)
    else setError(result.error ?? 'No se pudo cargar el control de accesos')
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load])

  const run = async (task: () => Promise<{ success: boolean; error?: string }>) => {
    setBusy(true)
    setError(null)
    const result = await task()
    setBusy(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo completar la acción')
      return false
    }
    await load()
    return true
  }

  const unitById = (unitId: string) => data?.units.find((unit) => unit.id === unitId)

  const tabs: [Tab, string][] = [
    ['solicitudes', 'Autorizaciones y visitas'],
    ['paqueteria', 'Paquetería'],
    ['llaves', 'Llaves y dispositivos'],
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Control de accesos</h1>
        <p className="mt-2 text-gray-600">Autorizaciones, visitantes, paquetería y llaves de las propiedades que lo tienen habilitado.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${tab === value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!loading && data && data.units.length === 0 && (
          <p className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Ninguna propiedad tiene el control de accesos habilitado. Se activa en las reglas de cada propiedad.
          </p>
        )}

        {!loading && data && data.units.length > 0 && tab === 'solicitudes' && (
          <div className="mt-6 space-y-3">
            {data.requests.length === 0 && <p className="text-sm text-gray-600">Sin solicitudes.</p>}
            {data.requests.map((item) => {
              const status = accessStatusConfig[item.status]
              const tenantName = [item.tenant.user.name, item.tenant.user.lastName].filter(Boolean).join(' ')
              return (
                <article key={item.id} className="space-y-2 rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {accessKindLabel[item.kind]}
                      {item.personName ? ` · ${item.personName}${item.personId ? ` (${item.personId})` : ''}` : ''}
                    </p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.box}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.details}</p>
                  <p className="text-xs text-gray-400">
                    {tenantName} · {item.property.name}
                    {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''} · {formatDateTime(item.scheduledAt)}
                    {item.untilAt ? ` a ${formatDateTime(item.untilAt)}` : ''}
                  </p>
                  {item.status === AccessRequestStatus.PENDING && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={notes[item.id] ?? ''}
                        onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                        placeholder="Nota o motivo (obligatorio al rechazar)"
                        className={`${inputClass} sm:max-w-sm`}
                      />
                      <button
                        disabled={busy}
                        onClick={() => run(() => decideAccessRequestAction({ requestId: item.id, approve: true, note: notes[item.id] }))}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Autorizar
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => run(() => decideAccessRequestAction({ requestId: item.id, approve: false, note: notes[item.id] }))}
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  {item.decisionNote && item.status !== AccessRequestStatus.PENDING && <p className="text-sm text-gray-700">Nota. {item.decisionNote}</p>}
                </article>
              )
            })}
          </div>
        )}

        {!loading && data && data.units.length > 0 && tab === 'paqueteria' && (
          <div className="mt-6 space-y-6">
            <section className="space-y-3 rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">Registrar paquete recibido</h2>
              <select value={pkg.unitId} onChange={(e) => setPkg({ ...pkg, unitId: e.target.value })} className={inputClass}>
                <option value="">Unidad destino</option>
                {data.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input value={pkg.description} onChange={(e) => setPkg({ ...pkg, description: e.target.value })} placeholder="Descripción del paquete" className={inputClass} />
                <input value={pkg.carrier} onChange={(e) => setPkg({ ...pkg, carrier: e.target.value })} placeholder="Transportadora o remitente (opcional)" className={inputClass} />
              </div>
              <button
                disabled={busy || !pkg.unitId || !pkg.description.trim()}
                onClick={async () => {
                  if (await run(() => registerPackageAction(pkg))) setPkg({ ...pkg, description: '', carrier: '' })
                }}
                className={buttonClass}
              >
                Registrar y avisar
              </button>
            </section>

            {data.packages.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-400">
                    {item.property.name} · Unidad {item.unit.unitNumber}
                    {item.carrier ? ` · ${item.carrier}` : ''} · {formatDateTime(item.receivedAt)}
                  </p>
                </div>
                {item.status === PackageStatus.RECEIVED ? (
                  <button disabled={busy} onClick={() => run(() => markPackageDeliveredAction(item.id))} className={buttonClass}>
                    Marcar entregado
                  </button>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {packageStatusLabel[item.status]} {formatDateTime(item.deliveredAt)}
                  </span>
                )}
              </article>
            ))}
          </div>
        )}

        {!loading && data && data.units.length > 0 && tab === 'llaves' && (
          <div className="mt-6 space-y-6">
            <section className="space-y-3 rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">Registrar entrega</h2>
              <select value={key.unitId} onChange={(e) => setKey({ ...key, unitId: e.target.value })} className={inputClass}>
                <option value="">Unidad</option>
                {data.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <select value={key.kind} onChange={(e) => setKey({ ...key, kind: e.target.value as AccessDeviceKind })} className={inputClass}>
                  {Object.entries(deviceKindLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input value={key.label} onChange={(e) => setKey({ ...key, label: e.target.value })} placeholder="Descripción" className={`${inputClass} sm:col-span-2`} />
                <input type="number" min={1} value={key.quantity} onChange={(e) => setKey({ ...key, quantity: e.target.value })} className={inputClass} />
              </div>
              <input value={key.holder} onChange={(e) => setKey({ ...key, holder: e.target.value })} placeholder="Quién la recibe" className={inputClass} />
              <button
                disabled={busy || !key.unitId || !key.label.trim() || !key.holder.trim()}
                onClick={async () => {
                  const propertyId = unitById(key.unitId)?.propertyId
                  if (!propertyId) return
                  const ok = await run(() => registerKeyAction({ propertyId, unitId: key.unitId, kind: key.kind, label: key.label, quantity: Number(key.quantity), holder: key.holder, notes: key.notes }))
                  if (ok) setKey({ ...key, label: '', holder: '', quantity: '1' })
                }}
                className={buttonClass}
              >
                Registrar
              </button>
            </section>

            {data.keys.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {deviceKindLabel[item.kind]} · {item.label} × {item.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.property.name}
                    {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''} · {item.holder} · {formatDateTime(item.issuedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{deviceStatusLabel[item.status]}</span>
                  {item.status === AccessDeviceStatus.DELIVERED && (
                    <>
                      <button disabled={busy} onClick={() => run(() => updateKeyStatusAction({ keyId: item.id, status: AccessDeviceStatus.RETURNED }))} className="text-xs font-semibold text-emerald-700 hover:underline">
                        Devuelta
                      </button>
                      <button disabled={busy} onClick={() => run(() => updateKeyStatusAction({ keyId: item.id, status: AccessDeviceStatus.LOST }))} className="text-xs font-semibold text-red-700 hover:underline">
                        Perdida
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
