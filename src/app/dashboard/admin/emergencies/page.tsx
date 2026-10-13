'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DrillScenario } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  getAdminEmergencyDataAction,
  registerDrillAction,
  saveEvacuationRouteAction,
  setEvacuationRouteActiveAction,
  type AdminEmergencyData,
} from '+/actions/emergencies'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'
const buttonClass = 'rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50'
const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')

const scenarioLabel: Record<DrillScenario, string> = {
  FIRE: 'Incendio',
  EARTHQUAKE: 'Sismo',
  FLOOD: 'Inundación',
  OTHER: 'Otro',
}

export default function AdminEmergenciesPage() {
  const [data, setData] = useState<AdminEmergencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [drill, setDrill] = useState({
    propertyId: '',
    scenario: DrillScenario.FIRE as DrillScenario,
    heldAt: '',
    participants: '0',
    durationMinutes: '',
    evaluation: '',
    improvements: '',
  })
  const [route, setRoute] = useState({ propertyId: '', name: '', steps: '', meetingPoint: '', planUrl: '' })

  const load = useCallback(async () => {
    const result = await getAdminEmergencyDataAction()
    if (result.success && result.data) {
      setData(result.data)
      const firstProperty = result.data.properties[0]?.id ?? ''
      setDrill((current) => ({ ...current, propertyId: current.propertyId || firstProperty }))
      setRoute((current) => ({ ...current, propertyId: current.propertyId || firstProperty }))
    } else setError(result.error ?? 'No se pudo cargar la información')
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

  const propertySelect = (value: string, onChange: (next: string) => void) => (
    <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
      {data?.properties.map((property) => (
        <option key={property.id} value={property.id}>
          {property.name}
        </option>
      ))}
    </select>
  )

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Emergencias</h1>
        <p className="mt-2 text-gray-600">Simulacros y rutas de evacuación del Tomo VII. Los inquilinos ven las rutas en la sección Reportes y solicitudes.</p>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!loading && data && (
          <div className="mt-8 space-y-10">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Rutas de evacuación</h2>
              <div className="space-y-3 rounded-lg border border-gray-200 p-5">
                {propertySelect(route.propertyId, (propertyId) => setRoute({ ...route, propertyId }))}
                <input value={route.name} onChange={(e) => setRoute({ ...route, name: e.target.value })} placeholder="Nombre (ej. Piso 2, Torre A)" className={inputClass} />
                <textarea value={route.steps} onChange={(e) => setRoute({ ...route, steps: e.target.value })} rows={4} placeholder="Recorrido paso a paso" className={inputClass} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input value={route.meetingPoint} onChange={(e) => setRoute({ ...route, meetingPoint: e.target.value })} placeholder="Punto de encuentro" className={inputClass} />
                  <input value={route.planUrl} onChange={(e) => setRoute({ ...route, planUrl: e.target.value })} placeholder="Enlace de la imagen del plano (opcional)" className={inputClass} />
                </div>
                <button
                  disabled={busy || !route.propertyId || !route.name.trim() || !route.steps.trim()}
                  onClick={async () => {
                    if (await run(() => saveEvacuationRouteAction(route))) setRoute({ ...route, name: '', steps: '', meetingPoint: '', planUrl: '' })
                  }}
                  className={buttonClass}
                >
                  Guardar ruta
                </button>
              </div>

              {data.routes.map((item) => (
                <article key={item.id} className="space-y-2 rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.property.name} · {item.name}
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => run(() => setEvacuationRouteActiveAction({ routeId: item.id, active: !item.active }))}
                      className="text-xs font-semibold text-gray-700 hover:underline"
                    >
                      {item.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-sm text-gray-600">{item.steps}</p>
                  {item.meetingPoint && <p className="text-xs text-gray-500">Punto de encuentro. {item.meetingPoint}</p>}
                  {!item.active && <p className="text-xs text-amber-700">Oculta para los inquilinos.</p>}
                </article>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Simulacros</h2>
              <div className="space-y-3 rounded-lg border border-gray-200 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {propertySelect(drill.propertyId, (propertyId) => setDrill({ ...drill, propertyId }))}
                  <select value={drill.scenario} onChange={(e) => setDrill({ ...drill, scenario: e.target.value as DrillScenario })} className={inputClass}>
                    {Object.entries(scenarioLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input type="date" value={drill.heldAt} onChange={(e) => setDrill({ ...drill, heldAt: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input type="number" min={0} value={drill.participants} onChange={(e) => setDrill({ ...drill, participants: e.target.value })} placeholder="Participantes" className={inputClass} />
                  <input type="number" min={0} value={drill.durationMinutes} onChange={(e) => setDrill({ ...drill, durationMinutes: e.target.value })} placeholder="Duración en minutos" className={inputClass} />
                </div>
                <textarea value={drill.evaluation} onChange={(e) => setDrill({ ...drill, evaluation: e.target.value })} rows={2} placeholder="Evaluación del simulacro" className={inputClass} />
                <textarea value={drill.improvements} onChange={(e) => setDrill({ ...drill, improvements: e.target.value })} rows={2} placeholder="Acciones de mejora" className={inputClass} />
                <button
                  disabled={busy || !drill.propertyId || !drill.heldAt}
                  onClick={async () => {
                    const ok = await run(() =>
                      registerDrillAction({
                        propertyId: drill.propertyId,
                        scenario: drill.scenario,
                        heldAt: drill.heldAt,
                        participants: Number(drill.participants),
                        durationMinutes: drill.durationMinutes ? Number(drill.durationMinutes) : null,
                        evaluation: drill.evaluation,
                        improvements: drill.improvements,
                      })
                    )
                    if (ok) setDrill({ ...drill, heldAt: '', evaluation: '', improvements: '', durationMinutes: '' })
                  }}
                  className={buttonClass}
                >
                  Registrar simulacro
                </button>
              </div>

              {data.drills.length === 0 ? (
                <p className="text-sm text-gray-600">Aún no hay simulacros registrados.</p>
              ) : (
                data.drills.map((item) => (
                  <article key={item.id} className="space-y-1 rounded-lg border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {scenarioLabel[item.scenario]} · {item.property.name} · {formatDate(item.heldAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.participants} participantes{item.durationMinutes ? ` · ${item.durationMinutes} min` : ''}
                    </p>
                    {item.evaluation && <p className="text-sm text-gray-700">Evaluación. {item.evaluation}</p>}
                    {item.improvements && <p className="text-sm text-gray-700">Mejoras. {item.improvements}</p>}
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
