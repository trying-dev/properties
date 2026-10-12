'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DisciplineOutcome, DisciplineStatus, FaultSeverity } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  createDisciplinaryCaseAction,
  decideDisciplinaryCaseAction,
  getAdminDisciplinaryCasesAction,
  getDisciplineOptionsAction,
  type AdminDisciplinaryCase,
} from '+/actions/discipline'
import { disciplineOutcomeLabel, disciplineStatusConfig, faultSeverityLabel } from '+/lib/disciplineLabels'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'
const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')

function CaseCard({ item, onChanged }: { item: AdminDisciplinaryCase; onChanged: () => void }) {
  const [outcome, setOutcome] = useState<DisciplineOutcome>(DisciplineOutcome.WARNING)
  const [decision, setDecision] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const status = disciplineStatusConfig[item.status]
  const tenantName = [item.tenant.user.name, item.tenant.user.lastName].filter(Boolean).join(' ') || item.tenant.user.email
  const [now] = useState(() => Date.now())
  const deadlinePassed = new Date(item.defenseDeadline).getTime() < now
  const canDecide = item.status === DisciplineStatus.DEFENSE_RECEIVED || (item.status === DisciplineStatus.NOTIFIED && deadlinePassed)

  const decide = async () => {
    setIsSaving(true)
    setError(null)
    const result = await decideDisciplinaryCaseAction({ caseId: item.id, outcome, decision })
    setIsSaving(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo registrar la decisión')
      return
    }
    onChanged()
  }

  return (
    <article className="space-y-3 rounded-lg border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">
          {item.number} · {faultSeverityLabel[item.severity]}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.box}`}>{status.label}</span>
      </div>
      <p className="text-xs text-gray-400">
        {tenantName} · {item.property.name}
        {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''} · Hechos del {formatDate(item.occurredAt)}
        {item.manualRef ? ` · ${item.manualRef}` : ''}
      </p>
      <p className="text-sm text-gray-700">{item.description}</p>

      {item.defense ? (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-gray-800">
          <span className="font-medium">Descargos ({formatDate(item.defenseAt)}). </span>
          {item.defense}
        </p>
      ) : (
        item.status === DisciplineStatus.NOTIFIED && (
          <p className="text-xs text-gray-500">Plazo de descargos hasta el {formatDate(item.defenseDeadline)}.</p>
        )
      )}

      {item.status === DisciplineStatus.DECIDED ? (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
          <span className="font-medium">{item.outcome ? disciplineOutcomeLabel[item.outcome] : 'Decisión'} ({formatDate(item.decidedAt)}). </span>
          {item.decision}
        </p>
      ) : (
        canDecide && (
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <select value={outcome} onChange={(e) => setOutcome(e.target.value as DisciplineOutcome)} className={`${inputClass} sm:w-64`}>
              {Object.entries(disciplineOutcomeLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={3}
              placeholder="Decisión motivada: hechos probados, valoración de los descargos y fundamento"
              className={inputClass}
            />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              onClick={decide}
              disabled={isSaving || !decision.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? 'Guardando…' : 'Emitir decisión'}
            </button>
          </div>
        )
      )}
    </article>
  )
}

export default function AdminDisciplinePage() {
  const [cases, setCases] = useState<AdminDisciplinaryCase[]>([])
  const [options, setOptions] = useState<{ tenantId: string; unitId: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [form, setForm] = useState({ target: '', severity: FaultSeverity.LIGHT as FaultSeverity, manualRef: '', occurredAt: '', description: '' })

  const load = useCallback(async () => {
    const [casesResult, optionsResult] = await Promise.all([getAdminDisciplinaryCasesAction(), getDisciplineOptionsAction()])
    if (casesResult.success && casesResult.data) setCases(casesResult.data)
    else setError(casesResult.error ?? 'No se pudieron cargar los procedimientos')
    if (optionsResult.success && optionsResult.data) setOptions(optionsResult.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load])

  const open = async () => {
    const [tenantId, unitId] = form.target.split('|')
    setIsSending(true)
    setError(null)
    setNotice(null)
    const result = await createDisciplinaryCaseAction({
      tenantId,
      unitId,
      severity: form.severity,
      description: form.description,
      manualRef: form.manualRef,
      occurredAt: form.occurredAt,
    })
    setIsSending(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo abrir el procedimiento')
      return
    }
    setNotice(`Procedimiento ${result.data?.number} abierto y notificado al inquilino`)
    setForm((current) => ({ ...current, description: '', manualRef: '' }))
    await load()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Régimen disciplinario</h1>
        <p className="mt-2 text-gray-600">Notificación, descargos y decisión motivada, según el Tomo IX del manual. Sin montos.</p>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

        {!loading && (
          <div className="mt-8 space-y-8">
            {options.length > 0 ? (
              <section className="space-y-4 rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Abrir procedimiento</h2>
                <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className={inputClass}>
                  <option value="">Selecciona inquilino y unidad</option>
                  {options.map((option) => (
                    <option key={`${option.tenantId}|${option.unitId}`} value={`${option.tenantId}|${option.unitId}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as FaultSeverity })} className={inputClass}>
                    {Object.entries(faultSeverityLabel).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input type="date" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} className={inputClass} />
                  <input
                    value={form.manualRef}
                    onChange={(e) => setForm({ ...form, manualRef: e.target.value })}
                    placeholder="Artículo del manual (opcional)"
                    className={inputClass}
                  />
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Hechos que motivan el procedimiento"
                  className={inputClass}
                />
                <button
                  onClick={open}
                  disabled={isSending || !form.target || !form.occurredAt || !form.description.trim()}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSending ? 'Notificando…' : 'Abrir y notificar'}
                </button>
              </section>
            ) : (
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Ninguna propiedad tiene el régimen disciplinario habilitado con contratos activos. Se activa en las reglas de cada propiedad.
              </p>
            )}

            <section className="space-y-4">
              {cases.length === 0 ? (
                <p className="text-sm text-gray-600">Aún no hay procedimientos.</p>
              ) : (
                cases.map((item) => <CaseCard key={`${item.id}-${item.status}`} item={item} onChanged={() => void load()} />)
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
