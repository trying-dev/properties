'use client'

import { useState } from 'react'
import { CheckCircle2, MessageSquareWarning, XCircle } from 'lucide-react'
import { ProcessStatus } from '+/generated/prisma/enums'

import Modal from '+/components/Modal'
import { requestProcessFeedbackAction, setProcessDecisionAction } from '+/actions/application-review'

type ReviewCounts = {
  approved: number
  pending: number
  feedback: number
  rejected: number
}

type DecisionModal = 'feedback' | 'approve' | 'reject'

type DecisionPanelProps = {
  processId: string
  status: ProcessStatus
  counts: ReviewCounts
  approvalConditions?: string | null
  notes?: string | null
  onChanged: () => void
}

const modalConfig: Record<DecisionModal, { title: string; placeholder: string; confirmLabel: string; confirmClass: string }> = {
  feedback: {
    title: 'Solicitar correcciones',
    placeholder: 'Mensaje para el inquilino (opcional). Se envía junto con los comentarios por item…',
    confirmLabel: 'Enviar solicitud',
    confirmClass: 'bg-amber-600 hover:bg-amber-700',
  },
  approve: {
    title: 'Aprobar solicitud',
    placeholder: 'Condiciones de aprobación (opcional)…',
    confirmLabel: 'Aprobar',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  reject: {
    title: 'Rechazar solicitud',
    placeholder: 'Motivo del rechazo (opcional, se notifica al inquilino)…',
    confirmLabel: 'Rechazar',
    confirmClass: 'bg-red-600 hover:bg-red-700',
  },
}

export default function DecisionPanel({ processId, status, counts, approvalConditions, notes, onChanged }: DecisionPanelProps) {
  const [openModal, setOpenModal] = useState<DecisionModal | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  if (status === ProcessStatus.APPROVED || status === ProcessStatus.DISAPPROVED) {
    const isApproved = status === ProcessStatus.APPROVED
    return (
      <div
        className={`flex items-start gap-3 rounded-lg border p-4 ${
          isApproved ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
        }`}
      >
        {isApproved ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}
        <div>
          <p className={`text-sm font-semibold ${isApproved ? 'text-emerald-800' : 'text-red-800'}`}>
            {isApproved ? 'Solicitud aprobada' : 'Solicitud rechazada'}
          </p>
          {isApproved && approvalConditions && <p className="mt-1 text-sm text-emerald-700">Condiciones: {approvalConditions}</p>}
          {!isApproved && notes && <p className="mt-1 text-sm text-red-700">Motivo: {notes}</p>}
        </div>
      </div>
    )
  }

  const openDecisionModal = (modal: DecisionModal) => {
    setOpenModal(modal)
    setMessage('')
    setError(null)
  }

  const closeModal = () => {
    if (isSubmitting) return
    setOpenModal(null)
    setError(null)
  }

  const handleConfirm = async () => {
    if (!openModal) return
    setIsSubmitting(true)
    setError(null)
    setWarning(null)

    const trimmed = message.trim() || null

    if (openModal === 'feedback') {
      const result = await requestProcessFeedbackAction({ processId, message: trimmed })
      setIsSubmitting(false)
      if (!result.success) {
        setError(result.error ?? 'No se pudo completar la acción')
        return
      }
      if (result.data && !result.data.emailSent) {
        setWarning(result.data.emailError ?? 'Estado actualizado, pero no se pudo enviar el correo al inquilino.')
      }
    } else {
      const result = await setProcessDecisionAction({
        processId,
        status: openModal === 'approve' ? ProcessStatus.APPROVED : ProcessStatus.DISAPPROVED,
        conditions: openModal === 'approve' ? trimmed : null,
        message: openModal === 'reject' ? trimmed : null,
      })
      setIsSubmitting(false)
      if (!result.success) {
        setError(result.error ?? 'No se pudo completar la acción')
        return
      }
    }

    setOpenModal(null)
    onChanged()
  }

  const config = openModal ? modalConfig[openModal] : null
  const summaryChip = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${summaryChip} bg-emerald-50 text-emerald-700 ring-emerald-600/20`}>{counts.approved} aprobados</span>
          <span className={`${summaryChip} bg-gray-100 text-gray-600 ring-gray-500/20`}>{counts.pending} pendientes</span>
          <span className={`${summaryChip} bg-amber-50 text-amber-700 ring-amber-600/20`}>{counts.feedback} con observaciones</span>
          {counts.rejected > 0 && (
            <span className={`${summaryChip} bg-red-50 text-red-700 ring-red-600/20`}>{counts.rejected} rechazados</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openDecisionModal('feedback')}
            disabled={counts.feedback === 0}
            title={counts.feedback === 0 ? 'Marca al menos un item con "Requiere ajuste" para pedir correcciones' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <MessageSquareWarning className="h-4 w-4" />
            Solicitar correcciones
          </button>
          <button
            type="button"
            onClick={() => openDecisionModal('reject')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => openDecisionModal('approve')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprobar
          </button>
        </div>
      </div>

      {warning && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{warning}</p>}

      <Modal isOpen={openModal !== null} onClose={closeModal} ariaLabel={config?.title} disableClose={isSubmitting}>
        {config && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
            {openModal === 'feedback' && (
              <p className="mt-1 text-sm text-gray-500">
                El proceso pasará a &quot;Esperando respuesta&quot; y el inquilino recibirá un correo y una notificación.
              </p>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={config.placeholder}
              className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={isSubmitting}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer ${config.confirmClass}`}
              >
                {isSubmitting ? 'Guardando…' : config.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
