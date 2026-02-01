'use client'

import { Clock, CheckCircle, XCircle } from 'lucide-react'

import DeleteProcess from './DeleteProcess'

type ProcessListItem = {
  id: string
  status: string
  currentStep: number | null
  updatedAt: string | Date
  unitId: string | null
}

type CardProcessProps = {
  process: ProcessListItem
  deleteConfirmId: string | null
  onResume: () => void
  onConfirmDelete: () => void
  onStartDelete: () => void
  onCancelDelete: () => void
}

const getStatusIcon = (status: string) => {
  if (status === 'APPROVED') return <CheckCircle className="w-4 h-4 text-green-600" />
  if (status === 'DISAPPROVED') return <XCircle className="w-4 h-4 text-red-600" />
  if (status === 'IN_PROGRESS') return <Clock className="w-4 h-4 text-yellow-600" />
  if (status === 'WAITING_FOR_FEEDBACK') return <Clock className="w-4 h-4 text-orange-600" />
  if (status === 'IN_EVALUATION') return <Clock className="w-4 h-4 text-blue-600" />
  return <Clock className="w-4 h-4 text-gray-500" />
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    IN_PROGRESS: { label: 'En progreso', className: 'bg-yellow-100 text-yellow-800' },
    IN_EVALUATION: { label: 'En evaluación', className: 'bg-blue-100 text-blue-800' },
    WAITING_FOR_FEEDBACK: { label: 'Esperando feedback', className: 'bg-orange-100 text-orange-800' },
    APPROVED: { label: 'Aprobado', className: 'bg-green-100 text-green-800' },
    DISAPPROVED: { label: 'Desaprobado', className: 'bg-red-100 text-red-800' },
  }
  const data = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' }
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${data.className}`}>{data.label}</span>
}

export default function CardProcess({ process, deleteConfirmId, onResume, onConfirmDelete, onStartDelete, onCancelDelete }: CardProcessProps) {
  const isConfirming = deleteConfirmId === process.id

  return (
    <div
      role="button"
      tabIndex={0}
      className="border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 hover:shadow-sm transition cursor-pointer"
      onClick={onResume}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onResume()
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(process.status)}
          <span className="text-sm text-gray-800 font-medium">Proceso #{process.id.slice(0, 6)}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge(process.status)}
          <DeleteProcess isConfirming={isConfirming} onConfirm={onConfirmDelete} onCancel={onCancelDelete} onStart={onStartDelete} />
        </div>
      </div>
      <p className="text-sm text-gray-600">Paso actual: {process.currentStep}</p>
      <p className="text-xs text-gray-500 mt-1">Última actualización: {new Date(process.updatedAt).toLocaleDateString('es-CO')}</p>
    </div>
  )
}
