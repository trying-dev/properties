'use client'

import { FileText, User, Building2, ShieldCheck, ClipboardList } from 'lucide-react'

import { processStatusConfig } from '+/lib/processStatus'
import { profiles, securityOptions } from '+/app/process/_/profiles'
import type { BasicInfo, Field, ProfileId, SecurityFieldValue } from '+/app/process/_/types'
import type { ProcessDetail } from '+/actions/processes'

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

export default function ApplicationDetail({ detail }: { detail: NonNullable<ProcessDetail> }) {
  const payload = (detail.payload ?? {}) as ProcessPayload
  const basicInfo = payload.basicInfo
  const profileConfig = payload.profile ? profiles[payload.profile] : null
  const securityId = payload.security?.selectedSecurity
  const securityOption = securityId ? securityOptions.find((o) => o.id === securityId) : null
  const securityFields = payload.security?.securityFields ?? {}

  const status = processStatusConfig[detail.status]

  // Campos de archivo declarados por perfil + garantía (aún no se almacenan: pendiente storage).
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

      <Section icon={FileText} title="Documentos">
        {documentFields.length === 0 ? (
          <p className="text-sm text-gray-500">No hay documentos requeridos para este perfil.</p>
        ) : (
          <>
            <p className="mb-3 text-xs text-amber-700">
              Almacenamiento de archivos pendiente. Por ahora se listan los documentos requeridos para esta solicitud.
            </p>
            <ul className="space-y-2">
              {documentFields.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{f.label}</span>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Pendiente</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </div>
  )
}
