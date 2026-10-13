'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DisciplineOutcome, DisciplineStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { fileAppealAction, getTenantDisciplinaryCasesAction, submitDefenseAction, type TenantDisciplinaryCase } from '+/actions/discipline'
import { appealOutcomeLabel, complianceStatusLabel, disciplineOutcomeLabel, disciplineStatusConfig, faultSeverityLabel } from '+/lib/disciplineLabels'

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')

function DefenseCard({ item, onChanged }: { item: TenantDisciplinaryCase; onChanged: () => void }) {
  const [defense, setDefense] = useState('')
  const [appeal, setAppeal] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [now] = useState(() => Date.now())
  const status = disciplineStatusConfig[item.status]
  const canDefend = item.status === DisciplineStatus.NOTIFIED && new Date(item.defenseDeadline).getTime() >= now

  const canAppeal =
    item.status === DisciplineStatus.DECIDED &&
    item.outcome !== DisciplineOutcome.DISMISSED &&
    !item.appealAt &&
    item.recourseDeadline != null &&
    new Date(item.recourseDeadline).getTime() >= now

  const run = async (task: () => Promise<{ success: boolean; error?: string }>, fallback: string) => {
    setIsSending(true)
    setError(null)
    const result = await task()
    setIsSending(false)
    if (!result.success) {
      setError(result.error ?? fallback)
      return
    }
    onChanged()
  }

  const send = () => run(() => submitDefenseAction({ caseId: item.id, defense }), 'No se pudieron enviar los descargos')
  const sendAppeal = () => run(() => fileAppealAction({ caseId: item.id, appeal }), 'No se pudo presentar el recurso')

  return (
    <article className="space-y-3 rounded-lg border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">
          {item.number} · {faultSeverityLabel[item.severity]}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.box}`}>{status.label}</span>
      </div>
      <p className="text-xs text-gray-400">
        {item.property.name}
        {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''} · Hechos del {formatDate(item.occurredAt)}
        {item.manualRef ? ` · ${item.manualRef}` : ''}
      </p>
      <p className="text-sm text-gray-700">{item.description}</p>

      {item.defense && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-gray-800">
          <span className="font-medium">Tus descargos ({formatDate(item.defenseAt)}). </span>
          {item.defense}
        </p>
      )}

      {item.outcome && item.decision && (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
          <span className="font-medium">{disciplineOutcomeLabel[item.outcome]} ({formatDate(item.decidedAt)}). </span>
          {item.decision}
        </p>
      )}

      {item.appeal && (
        <p className="rounded-lg bg-purple-50 p-3 text-sm text-gray-800">
          <span className="font-medium">Tu recurso ({formatDate(item.appealAt)}). </span>
          {item.appeal}
        </p>
      )}

      {item.appealOutcome && (
        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
          <span className="font-medium">{appealOutcomeLabel[item.appealOutcome]} ({formatDate(item.appealDecidedAt)}). </span>
          {item.appealDecision}
        </p>
      )}

      {item.complianceStatus && (
        <p className="text-xs text-gray-500">
          Seguimiento. {complianceStatusLabel[item.complianceStatus]}
          {item.complianceNote ? `. ${item.complianceNote}` : ''}
        </p>
      )}

      {canAppeal && (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">Puedes interponer recurso de reposición hasta el {formatDate(item.recourseDeadline)}. Se presenta una sola vez.</p>
          <textarea
            value={appeal}
            onChange={(e) => setAppeal(e.target.value)}
            rows={4}
            placeholder="Argumentos y pruebas que respaldan el recurso"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            onClick={sendAppeal}
            disabled={isSending || !appeal.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSending ? 'Enviando…' : 'Presentar recurso'}
          </button>
        </div>
      )}

      {canDefend && (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">Puedes presentar tus descargos hasta el {formatDate(item.defenseDeadline)}.</p>
          <textarea
            value={defense}
            onChange={(e) => setDefense(e.target.value)}
            rows={4}
            placeholder="Explica tu versión de los hechos"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            onClick={send}
            disabled={isSending || !defense.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSending ? 'Enviando…' : 'Presentar descargos'}
          </button>
        </div>
      )}
    </article>
  )
}

export default function TenantDisciplinePage() {
  const [cases, setCases] = useState<TenantDisciplinaryCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const result = await getTenantDisciplinaryCasesAction()
    if (result.success && result.data) setCases(result.data)
    else setError(result.error ?? 'No se pudieron cargar los procedimientos')
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/tenant" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones disciplinarias</h1>
        <p className="mt-2 text-gray-600">Aquí ves los procedimientos abiertos en tu contra, presentas descargos y consultas la decisión.</p>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <p className="mt-8 text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="mt-8 space-y-4">
            {cases.length === 0 ? (
              <p className="text-sm text-gray-600">No tienes procedimientos abiertos.</p>
            ) : (
              cases.map((item) => <DefenseCard key={`${item.id}-${item.status}`} item={item} onChanged={() => void load()} />)
            )}
          </div>
        )}
      </main>
    </div>
  )
}
