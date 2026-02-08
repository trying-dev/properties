'use client'

import Modal from '+/components/Modal'
import type { TenantProcessItem } from '+/actions/processes'
import type { BasicInfo, ProfileId, SecurityFieldValue } from '+/app/process/_/types'
import { profiles, securityOptions } from '+/app/process/_/profiles'

export type ProcessPayload = {
  basicInfo?: BasicInfo
  profile?: ProfileId
  security?: {
    selectedSecurity?: string
    securityFields?: Record<string, SecurityFieldValue>
  }
}

type ProcessReviewModalProps = {
  isOpen: boolean
  onClose: () => void
  process: TenantProcessItem | null
  payload: ProcessPayload | null
  isLoading: boolean
}

const statusBadge = (status?: string) => {
  const map: Record<string, { label: string; className: string }> = {
    IN_PROGRESS: { label: 'En progreso', className: 'bg-amber-100 text-amber-800 border border-amber-200' },
    IN_EVALUATION: { label: 'En evaluación', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
    WAITING_FOR_FEEDBACK: { label: 'Esperando feedback', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
    APPROVED: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
    DISAPPROVED: { label: 'Desaprobado', className: 'bg-rose-100 text-rose-800 border border-rose-200' },
  }
  const data = status ? map[status] : null
  if (!data) return null
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${data.className}`}>{data.label}</span>
}

const formatValue = (value: SecurityFieldValue | undefined) => {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return String(value)
}

const detailItem = (label: string, value?: string | null) => {
  if (!value) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

export default function ProcessReviewModal({ isOpen, onClose, process, payload, isLoading }: ProcessReviewModalProps) {
  if (!process) return null

  const basicInfo = payload?.basicInfo
  const profileId = payload?.profile
  const profileConfig = profileId ? profiles[profileId] : null
  const security = payload?.security
  const securityOption = security?.selectedSecurity
    ? securityOptions.find((option) => option.id === security.selectedSecurity)
    : null
  const securityFields = security?.securityFields ?? {}
  const securityDetails = securityOption
    ? securityOption.fields
        .filter((field) => field.type !== 'file')
        .map((field) => ({
          label: field.label,
          value: formatValue(securityFields[field.id]),
        }))
        .filter((item) => item.value)
    : []

  const property = process.unit?.property
  const address = property
    ? `${property.street ?? ''} ${property.number ?? ''}, ${property.neighborhood ?? ''}, ${property.city ?? ''}`.trim()
    : 'Dirección no disponible'

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Resumen de solicitud" className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Solicitud</p>
            <h2 className="text-xl font-semibold text-gray-900">{property?.name ?? 'Proceso sin propiedad'}</h2>
            <p className="text-sm text-gray-500">{address}</p>
            <p className="text-xs text-gray-400 mt-1">Proceso #{process.id.slice(0, 6)} · Unidad {process.unit?.unitNumber ?? '-'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {statusBadge(process.status)}
            <span className="text-xs text-gray-400">Última actualización: {new Date(process.updatedAt).toLocaleDateString('es-CO')}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-500">Cargando solicitud...</div>
        ) : (
          <div className="space-y-6 mt-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Datos personales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailItem('Nombre', `${basicInfo?.name ?? ''} ${basicInfo?.lastName ?? ''}`.trim())}
                {detailItem('Email', basicInfo?.email)}
                {detailItem('Teléfono', basicInfo?.phone ?? null)}
                {detailItem('Documento', basicInfo?.documentNumber ?? null)}
                {detailItem('Profesión', basicInfo?.profession ?? null)}
                {detailItem('Ingreso mensual', basicInfo?.monthlyIncome ?? null)}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Perfil de ingresos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailItem('Perfil', profileConfig?.name ?? null)}
                {detailItem('Depósito sugerido', profileConfig?.deposit ?? null)}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Garantía seleccionada</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailItem('Tipo', securityOption?.name ?? null)}
                {detailItem('Requisitos', securityOption?.requirements ?? null)}
              </div>
            </section>

            {securityDetails.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Datos adicionales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {securityDetails.map((item) => detailItem(item.label, item.value))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}
