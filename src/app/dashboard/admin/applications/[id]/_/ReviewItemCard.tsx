'use client'

import { useState } from 'react'
import { Check, MessageSquareWarning, X } from 'lucide-react'
import { ProcessReviewStatus, ProcessReviewTargetType } from '@prisma/client'

import { upsertProcessReviewItemAction } from '+/actions/application-review'
import type { ProcessReviewBundle } from '+/actions/application-review'

export type ReviewTarget = {
  targetType: ProcessReviewTargetType
  targetId: string
  label: string
  documentId?: string | null
}

export type ReviewItem = ProcessReviewBundle['reviewItems'][number]

export const reviewStatusConfig: Record<ProcessReviewStatus, { label: string; box: string }> = {
  PENDING: { label: 'Pendiente', box: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
  APPROVED: { label: 'Aprobado', box: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  NEEDS_FEEDBACK: { label: 'Requiere ajuste', box: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  REJECTED: { label: 'Rechazado', box: 'bg-red-50 text-red-700 ring-red-600/20' },
}

type CommentMode = typeof ProcessReviewStatus.NEEDS_FEEDBACK | typeof ProcessReviewStatus.REJECTED

type ReviewItemCardProps = {
  processId: string
  target: ReviewTarget
  item?: ReviewItem
  subtitle?: string | null
  disabled?: boolean
  onChanged: () => void
}

export default function ReviewItemCard({ processId, target, item, subtitle, disabled, onChanged }: ReviewItemCardProps) {
  const [commentMode, setCommentMode] = useState<CommentMode | null>(null)
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = item?.status ?? ProcessReviewStatus.PENDING
  const statusStyle = reviewStatusConfig[status]

  const save = async (nextStatus: ProcessReviewStatus, adminComment: string | null) => {
    setIsSaving(true)
    setError(null)
    const result = await upsertProcessReviewItemAction({
      processId,
      targetType: target.targetType,
      targetId: target.targetId,
      status: nextStatus,
      documentId: target.documentId ?? null,
      adminComment,
    })
    setIsSaving(false)
    if (!result.success) {
      setError(result.error ?? 'No se pudo guardar la revisión')
      return
    }
    setCommentMode(null)
    setComment('')
    onChanged()
  }

  const handleCommentSubmit = () => {
    if (!commentMode) return
    if (commentMode === ProcessReviewStatus.NEEDS_FEEDBACK && !comment.trim()) {
      setError('Escribe un comentario para el inquilino')
      return
    }
    void save(commentMode, comment.trim() || null)
  }

  const openCommentMode = (mode: CommentMode) => {
    setCommentMode(mode)
    setComment(item?.adminComment ?? '')
    setError(null)
  }

  const actionButton = 'p-1.5 rounded-full transition-transform active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">{target.label}</p>
          {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyle.box}`}>
            {statusStyle.label}
          </span>
          {!disabled && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={`${actionButton} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
                onClick={() => void save(ProcessReviewStatus.APPROVED, null)}
                disabled={isSaving}
                title="Aprobar"
                aria-label={`Aprobar ${target.label}`}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`${actionButton} text-amber-600 hover:bg-amber-50 hover:text-amber-700`}
                onClick={() => openCommentMode(ProcessReviewStatus.NEEDS_FEEDBACK)}
                disabled={isSaving}
                title="Pedir corrección"
                aria-label={`Pedir corrección de ${target.label}`}
              >
                <MessageSquareWarning className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`${actionButton} text-red-600 hover:bg-red-50 hover:text-red-700`}
                onClick={() => openCommentMode(ProcessReviewStatus.REJECTED)}
                disabled={isSaving}
                title="Rechazar"
                aria-label={`Rechazar ${target.label}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {commentMode && (
        <div className="mt-2 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder={
              commentMode === ProcessReviewStatus.NEEDS_FEEDBACK
                ? 'Explica al inquilino qué debe corregir…'
                : 'Motivo del rechazo (opcional)…'
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCommentSubmit}
              disabled={isSaving}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Guardando…' : commentMode === ProcessReviewStatus.NEEDS_FEEDBACK ? 'Guardar corrección' : 'Guardar rechazo'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCommentMode(null)
                setError(null)
              }}
              disabled={isSaving}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {!commentMode && item?.adminComment && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="font-semibold">Comentario:</span> {item.adminComment}
        </p>
      )}
      {item?.tenantResponse && (
        <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <span className="font-semibold">Respuesta del inquilino:</span> {item.tenantResponse}
        </p>
      )}
    </div>
  )
}
