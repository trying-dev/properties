'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { CaseKind } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  createCaseAction,
  getTenantCaseContextAction,
  getTenantCasesAction,
  type TenantCaseContext,
  type TenantCaseItem,
} from '+/actions/cases'
import { caseKindLabel, caseStatusConfig } from '+/lib/caseLabels'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'

const deviceLabel: Record<string, string> = { EXTINGUISHER: 'Extintor', ALARM: 'Alarma', DETECTOR: 'Detector' }

export default function TenantCasesPage() {
  const [context, setContext] = useState<TenantCaseContext | null>(null)
  const [cases, setCases] = useState<TenantCaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [form, setForm] = useState({ unitId: '', kind: CaseKind.PROBLEM as CaseKind, subject: '', description: '' })

  const load = useCallback(async () => {
    const [contextResult, casesResult] = await Promise.all([getTenantCaseContextAction(), getTenantCasesAction()])
    if (contextResult.success && contextResult.data) {
      setContext(contextResult.data)
      setForm((current) => ({ ...current, unitId: current.unitId || contextResult.data!.units[0]?.id || '' }))
    } else setError(contextResult.error ?? 'No se pudo cargar la información')
    if (casesResult.success && casesResult.data) setCases(casesResult.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load])

  const send = async () => {
    setIsSending(true)
    setError(null)
    setNotice(null)
    const result = await createCaseAction(form)
    setIsSending(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo radicar el caso')
      return
    }
    setNotice(`Caso radicado con el número ${result.data?.number}`)
    setForm((current) => ({ ...current, subject: '', description: '' }))
    await load()
  }

  const canReport = (context?.units.length ?? 0) > 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/tenant" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y solicitudes</h1>
        <p className="mt-2 text-gray-600">Radica una petición, queja, reclamo, sugerencia o el problema de tu unidad y sigue su estado.</p>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

        {!loading && context && (
          <div className="mt-8 space-y-8">
            {canReport ? (
              <section className="space-y-4 rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Nuevo caso</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Unidad</span>
                    <select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} className={inputClass}>
                      {context.units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.propertyName} · Unidad {unit.unitNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">Tipo</span>
                    <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as CaseKind })} className={inputClass}>
                      {Object.entries(caseKindLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Asunto"
                  className={inputClass}
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe lo ocurrido"
                  rows={4}
                  className={inputClass}
                />
                <button
                  onClick={send}
                  disabled={isSending || !form.subject.trim() || !form.description.trim()}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSending ? 'Enviando…' : 'Radicar caso'}
                </button>
              </section>
            ) : (
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Tus propiedades aún no tienen habilitados los reportes. Si necesitas algo, escribe a la administración.
              </p>
            )}

            {context.emergency.length > 0 && (
              <section className="space-y-4 rounded-lg border border-red-200 bg-red-50/50 p-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900">En caso de emergencia</h2>
                </div>
                {context.emergency.map((item) => (
                  <div key={item.propertyId} className="space-y-2 text-sm text-gray-800">
                    {context.emergency.length > 1 && <p className="font-semibold">{item.propertyName}</p>}
                    {item.info && <p className="whitespace-pre-line">{item.info}</p>}
                    {item.routes.map((route) => (
                      <div key={route.id} className="rounded-lg border border-red-100 bg-white p-3">
                        <p className="font-semibold">Ruta de evacuación. {route.name}</p>
                        <p className="mt-1 whitespace-pre-line text-gray-700">{route.steps}</p>
                        {route.meetingPoint && <p className="mt-1 text-gray-700">Punto de encuentro. {route.meetingPoint}</p>}
                        {route.planUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- enlace externo pegado por el administrador
                          <img src={route.planUrl} alt={`Plano de evacuación ${route.name}`} className="mt-2 max-h-72 w-full rounded border border-gray-200 object-contain" />
                        )}
                      </div>
                    ))}
                    {item.lastDrill && (
                      <p className="text-xs text-gray-500">Último simulacro. {new Date(item.lastDrill.heldAt).toLocaleDateString('es-CO')}</p>
                    )}
                    {item.devices.length > 0 && (
                      <ul className="list-inside list-disc text-gray-700">
                        {item.devices.map((device) => (
                          <li key={device.id}>
                            {deviceLabel[device.type] ?? device.type}
                            {device.location ? `, ${device.location}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Mis casos</h2>
              {cases.length === 0 ? (
                <p className="text-sm text-gray-600">Aún no has radicado casos.</p>
              ) : (
                cases.map((item) => {
                  const status = caseStatusConfig[item.status]
                  return (
                    <article key={item.id} className="space-y-2 rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.number} · {caseKindLabel[item.kind]}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.box}`}>{status.label}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{item.subject}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs text-gray-400">
                        {item.property.name}
                        {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''} · {new Date(item.createdAt).toLocaleDateString('es-CO')}
                      </p>
                      {item.response && (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                          <span className="font-medium">Respuesta de la administración. </span>
                          {item.response}
                        </p>
                      )}
                    </article>
                  )
                })
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
