'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CaseStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { getAdminCasesAction, respondCaseAction, type AdminCaseItem } from '+/actions/cases'
import { caseKindLabel, caseStatusConfig } from '+/lib/caseLabels'

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900'

function CaseCard({ item, onChanged }: { item: AdminCaseItem; onChanged: () => void }) {
  const [response, setResponse] = useState(item.response ?? '')
  const [status, setStatus] = useState<CaseStatus>(item.status)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenantName = [item.tenant.user.name, item.tenant.user.lastName].filter(Boolean).join(' ') || item.tenant.user.email
  const config = caseStatusConfig[item.status]

  const save = async () => {
    setIsSaving(true)
    setError(null)
    const result = await respondCaseAction({ caseId: item.id, status, response })
    setIsSaving(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo guardar')
      return
    }
    onChanged()
  }

  return (
    <article className="space-y-3 rounded-lg border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">
          {item.number} · {caseKindLabel[item.kind]}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.box}`}>{config.label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">{item.subject}</p>
      <p className="text-sm text-gray-600">{item.description}</p>
      <p className="text-xs text-gray-400">
        {tenantName}
        {item.tenant.user.phone ? ` · ${item.tenant.user.phone}` : ''} · {item.property.name}
        {item.unit ? ` · Unidad ${item.unit.unitNumber}` : ''} · {new Date(item.createdAt).toLocaleDateString('es-CO')}
      </p>

      <textarea
        value={response}
        onChange={(event) => setResponse(event.target.value)}
        placeholder="Respuesta para el inquilino"
        rows={2}
        className={inputClass}
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <select value={status} onChange={(event) => setStatus(event.target.value as CaseStatus)} className={`${inputClass} sm:w-48`}>
          {Object.entries(caseStatusConfig).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={save}
          disabled={isSaving}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </article>
  )
}

export default function AdminCasesPage() {
  const [cases, setCases] = useState<AdminCaseItem[]>([])
  const [filter, setFilter] = useState<CaseStatus | 'ACTIVE' | 'ALL'>('ACTIVE')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const result = await getAdminCasesAction()
    if (result.success && result.data) setCases(result.data)
    else setError(result.error ?? 'No se pudieron cargar los casos')
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    void load()
  }, [load])

  const visible = useMemo(() => {
    if (filter === 'ALL') return cases
    if (filter === 'ACTIVE') return cases.filter((item) => item.status === CaseStatus.OPEN || item.status === CaseStatus.IN_PROGRESS)
    return cases.filter((item) => item.status === filter)
  }, [cases, filter])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">PQRS y reportes</h1>
        <p className="mt-2 text-gray-600">Casos radicados por los inquilinos de las propiedades que lo tienen habilitado.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {([['ACTIVE', 'Por atender'], ['ALL', 'Todos'], ...Object.entries(caseStatusConfig).map(([value, { label }]) => [value, label])] as [string, string][]).map(
            ([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value as CaseStatus | 'ACTIVE' | 'ALL')}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {loading && <p className="mt-8 text-gray-600">Cargando…</p>}
        {error && <p className="mt-8 text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="mt-6 space-y-4">
            {visible.length === 0 ? (
              <p className="text-sm text-gray-600">No hay casos en esta vista.</p>
            ) : (
              visible.map((item) => <CaseCard key={`${item.id}-${item.status}-${item.respondedAt}`} item={item} onChanged={() => void load()} />)
            )}
          </div>
        )}
      </main>
    </div>
  )
}
