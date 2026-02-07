'use client'

import ConfirmDeleteButton from '+/components/ConfirmDeleteButton'
import type { TenantProcessItem } from '+/actions/processes'

type CardProcessProps = {
  process: TenantProcessItem
  canResume: boolean
  deleteConfirmId: string | null
  onResume: () => void
  onView: () => void
  canDelete: boolean
  onConfirmDelete: () => void
  onStartDelete: () => void
  onCancelDelete: () => void
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    IN_PROGRESS: { label: 'En progreso', className: 'bg-amber-100 text-amber-800 border border-amber-200' },
    IN_EVALUATION: { label: 'En evaluación', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
    WAITING_FOR_FEEDBACK: { label: 'Esperando feedback', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
    APPROVED: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    DISAPPROVED: { label: 'Desaprobado', className: 'bg-rose-100 text-rose-800 border border-rose-200' },
  }
  const data = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-800 border border-gray-200' }
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${data.className}`}>{data.label}</span>
}

export default function CardProcess({
  process,
  canResume,
  deleteConfirmId,
  onResume,
  onView,
  canDelete,
  onConfirmDelete,
  onStartDelete,
  onCancelDelete,
}: CardProcessProps) {
  const isConfirming = deleteConfirmId === process.id
  const property = process.unit?.property
  const address = property
    ? `${property.street ?? ''} ${property.number ?? ''}, ${property.neighborhood ?? ''}, ${property.city ?? ''}`.trim()
    : 'Dirección no disponible'
  const metaItemClass = 'inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700'

  return (
    <div
      role={canResume ? 'button' : undefined}
      tabIndex={canResume ? 0 : -1}
      className={`rounded-2xl border border-gray-200 p-5 text-left transition ${
        canResume ? 'bg-white hover:border-gray-300 hover:shadow-md cursor-pointer' : 'bg-gray-50 cursor-default'
      }`}
      onClick={canResume ? onResume : undefined}
      onKeyDown={(event) => {
        if (!canResume) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onResume()
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2">{statusBadge(process.status)}</div>
          <h3 className="text-lg font-semibold text-gray-900">{property?.name ?? 'Proceso sin propiedad'}</h3>
          <p className="text-sm text-gray-500">{address}</p>
        </div>
        <div className="flex items-center gap-2">
          {canDelete ? (
            <ConfirmDeleteButton isConfirming={isConfirming} onConfirm={onConfirmDelete} onCancel={onCancelDelete} onStart={onStartDelete} />
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onView()
              }}
              className="inline-flex items-center text-blue-600 text-xs font-semibold hover:text-blue-700"
            >
              Ver solicitud
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={metaItemClass}>Proceso #{process.id.slice(0, 6)}</span>
        <span className={metaItemClass}>Unidad {process.unit?.unitNumber ?? '-'}</span>
        <span className={metaItemClass}>Paso {process.currentStep}</span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Última actualización: {new Date(process.updatedAt).toLocaleDateString('es-CO')}</span>
        {canResume && <span className="inline-flex items-center text-blue-600 font-semibold">Continuar</span>}
      </div>
    </div>
  )
}
