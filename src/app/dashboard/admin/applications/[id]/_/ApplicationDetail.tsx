'use client'

import { FileText, User, Building2, ShieldCheck, ClipboardList, ClipboardCheck } from 'lucide-react'
import { ProcessReviewStatus, ProcessReviewTargetType } from '@prisma/client'

import { processStatusConfig } from '+/lib/processStatus'
import { profiles, securityOptions } from '+/app/process/_/profiles'
import type { BasicInfo, Field, ProfileId, SecurityFieldValue } from '+/app/process/_/types'
import type { ProcessDetail } from '+/actions/processes'
import type { ProcessReviewBundle } from '+/actions/application-review'

import DecisionPanel from './DecisionPanel'
import ReviewItemCard, { type ReviewItem, type ReviewTarget } from './ReviewItemCard'

type ProcessPayload = {
  basicInfo?: BasicInfo
  profile?: ProfileId
  security?: {
    selectedSecurity?: string
    securityFields?: Record<string, SecurityFieldValue>
  }
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return '-'
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('es-CO')
}

const formatValue = (value: SecurityFieldValue | undefined) => {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return String(value)
}

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const Item = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}

const Section = ({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-gray-500" />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
)

type ApplicationDetailProps = {
  detail: NonNullable<ProcessDetail>
  bundle: ProcessReviewBundle | null
  onChanged: () => void
}

export default function ApplicationDetail({ detail, bundle, onChanged }: ApplicationDetailProps) {
  const payload = (detail.payload ?? {}) as ProcessPayload
  const basicInfo = payload.basicInfo
  const profileConfig = payload.profile ? profiles[payload.profile] : null
  const securityId = payload.security?.selectedSecurity
  const securityOption = securityId ? securityOptions.find((o) => o.id === securityId) : null
  const securityFields = payload.security?.securityFields ?? {}

  const status = processStatusConfig[detail.status]
  const isFinalStatus = detail.status === 'APPROVED' || detail.status === 'DISAPPROVED'

  // Campos de archivo declarados por perfil + garantía.
  const documentFields: Field[] = [
    ...(profileConfig?.fields ?? []),
    ...(securityOption?.fields ?? []),
  ].filter((f) => f.type === 'file')

  const securityDetails = securityOption
    ? securityOption.fields
        .filter((f) => f.type !== 'file')
        .map((f) => ({ label: f.label, value: formatValue(securityFields[f.id]) }))
        .filter((i) => i.value)
    : []

  // Última versión de cada documento subido, agrupada por documentType.
  const latestDocumentsByType = new Map<string, ProcessReviewBundle['documents']>()
  for (const document of bundle?.documents ?? []) {
    if (!document.isLatest) continue
    const existing = latestDocumentsByType.get(document.documentType)
    if (existing) existing.push(document)
    else latestDocumentsByType.set(document.documentType, [document])
  }

  const reviewItemsByKey = new Map<string, ReviewItem>()
  for (const item of bundle?.reviewItems ?? []) {
    reviewItemsByKey.set(`${item.targetType}:${item.targetId}`, item)
  }

  const sectionTargets: ReviewTarget[] = [
    ...(basicInfo ? [{ targetType: ProcessReviewTargetType.SECTION, targetId: 'basicInfo', label: 'Datos personales' }] : []),
    ...(profileConfig || securityOption
      ? [{ targetType: ProcessReviewTargetType.SECTION, targetId: 'security', label: 'Perfil y garantía' }]
      : []),
  ]

  const documentTargets: (ReviewTarget & { subtitle: string })[] = documentFields.map((field) => {
    const latestDocuments = latestDocumentsByType.get(field.id) ?? []
    const fileNames = latestDocuments.map((d) => d.fileName).join(', ')
    const size = formatFileSize(latestDocuments[0]?.fileSize)
    return {
      targetType: ProcessReviewTargetType.DOCUMENT,
      targetId: field.id,
      label: field.label,
      documentId: latestDocuments[0]?.id ?? null,
      subtitle: latestDocuments.length
        ? `v${latestDocuments[0].version} · ${fileNames}${size ? ` · ${size}` : ''}`
        : 'Sin archivo subido',
    }
  })

  const allTargets = [...sectionTargets, ...documentTargets]
  const counts = { approved: 0, pending: 0, feedback: 0, rejected: 0 }
  for (const target of allTargets) {
    const itemStatus = reviewItemsByKey.get(`${target.targetType}:${target.targetId}`)?.status ?? ProcessReviewStatus.PENDING
    if (itemStatus === ProcessReviewStatus.APPROVED) counts.approved += 1
    else if (itemStatus === ProcessReviewStatus.NEEDS_FEEDBACK) counts.feedback += 1
    else if (itemStatus === ProcessReviewStatus.REJECTED) counts.rejected += 1
    else counts.pending += 1
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de aplicación</h1>
            <p className="text-sm text-gray-500">ID: {detail.id}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.box}`}>
              {status.label}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Paso {detail.currentStep}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Item label="Última actualización" value={formatDate(detail.updatedAt)} />
          <Item label="Creado" value={formatDate(detail.createdAt)} />
        </div>
      </div>

      <DecisionPanel
        processId={detail.id}
        status={detail.status}
        counts={counts}
        approvalConditions={bundle?.approvalConditions}
        notes={detail.notes}
        onChanged={onChanged}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section icon={User} title="Inquilino">
          {detail.tenant ? (
            <div className="grid grid-cols-1 gap-3">
              <Item
                label="Nombre"
                value={
                  [detail.tenant.user.name, detail.tenant.user.lastName].filter(Boolean).join(' ') || detail.tenant.user.email || '-'
                }
              />
              <Item label="Email" value={detail.tenant.user.email} />
              <Item label="Teléfono" value={detail.tenant.user.phone} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin inquilino asociado.</p>
          )}
        </Section>

        <Section icon={Building2} title="Unidad">
          {detail.unit ? (
            <div className="grid grid-cols-1 gap-3">
              <Item label="Propiedad" value={detail.unit.property.name} />
              <Item label="Ciudad" value={detail.unit.property.city} />
              <Item label="Unidad" value={detail.unit.unitNumber} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin unidad asociada.</p>
          )}
        </Section>
      </div>

      {basicInfo && (
        <Section icon={ClipboardList} title="Datos personales">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Item label="Nombre" value={`${basicInfo.name ?? ''} ${basicInfo.lastName ?? ''}`.trim()} />
            <Item label="Email" value={basicInfo.email} />
            <Item label="Teléfono" value={basicInfo.phone} />
            <Item label="Documento" value={basicInfo.documentNumber} />
            <Item label="Profesión" value={basicInfo.profession} />
            <Item label="Ingreso mensual" value={basicInfo.monthlyIncome} />
          </div>
        </Section>
      )}

      {(profileConfig || securityOption) && (
        <Section icon={ShieldCheck} title="Perfil y garantía">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Item label="Perfil de ingresos" value={profileConfig?.name} />
            <Item label="Depósito sugerido" value={profileConfig?.deposit} />
            <Item label="Garantía" value={securityOption?.name} />
            <Item label="Requisitos" value={securityOption?.requirements} />
          </div>
          {securityDetails.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {securityDetails.map((i) => (
                <Item key={i.label} label={i.label} value={i.value} />
              ))}
            </div>
          )}
        </Section>
      )}

      <Section icon={ClipboardCheck} title="Revisión">
        {!bundle ? (
          <p className="text-sm text-gray-500">No se pudo cargar la información de revisión.</p>
        ) : allTargets.length === 0 ? (
          <p className="text-sm text-gray-500">El inquilino aún no ha enviado información para revisar.</p>
        ) : (
          <div className="space-y-6">
            {sectionTargets.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Secciones</h3>
                <div className="space-y-2">
                  {sectionTargets.map((target) => (
                    <ReviewItemCard
                      key={`${target.targetType}:${target.targetId}`}
                      processId={detail.id}
                      target={target}
                      item={reviewItemsByKey.get(`${target.targetType}:${target.targetId}`)}
                      disabled={isFinalStatus}
                      onChanged={onChanged}
                    />
                  ))}
                </div>
              </div>
            )}

            {documentTargets.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Documentos
                  </span>
                </h3>
                <div className="space-y-2">
                  {documentTargets.map((target) => (
                    <ReviewItemCard
                      key={`${target.targetType}:${target.targetId}`}
                      processId={detail.id}
                      target={target}
                      item={reviewItemsByKey.get(`${target.targetType}:${target.targetId}`)}
                      subtitle={target.subtitle}
                      disabled={isFinalStatus}
                      onChanged={onChanged}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  )
}
