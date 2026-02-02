import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, FileText } from 'lucide-react'

import Header from '+/components/Header'
import { getUnitById } from '+/actions/nuevo-proceso'
import type { ContractStatus, ContractPriority, PaymentStatus, PaymentType, UnitStatus } from '@prisma/client'
import UnitActions from './_/UnitActions'
import { toUnitFormState } from '../_/unitFormUtils'

const formatDate = (value?: Date | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

const formatBool = (value?: boolean | null) => {
  if (value == null) return '-'
  return value ? 'Sí' : 'No'
}

const unitStatusLabel: Record<UnitStatus, string> = {
  VACANT: 'Vacante',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
  MAINTENANCE: 'Mantenimiento',
  UNAVAILABLE: 'No disponible',
}

const contractStatusLabel: Record<ContractStatus, string> = {
  INITIATED: 'Iniciado',
  UNDER_REVIEW: 'En revisión',
  DOCUMENTATION: 'Documentación',
  APPROVED: 'Aprobado',
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  ACTIVE: 'Activo',
  EXPIRED: 'Vencido',
  RENEWED: 'Renovado',
  TERMINATED: 'Terminado',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rechazado',
}

const contractPriorityLabel: Record<ContractPriority, string> = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
}

const paymentTypeLabel: Record<PaymentType, string> = {
  RENT: 'Canon',
  DEPOSIT: 'Depósito',
  UTILITIES: 'Servicios',
  MAINTENANCE: 'Mantenimiento',
  LATE_FEE: 'Mora',
  OTHER: 'Otro',
}

const parseImages = (value?: string | null) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default async function AdminUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const unit = await getUnitById({ id })
  if (!unit) return notFound()
  const initialForm = toUnitFormState(unit)

  const images = parseImages(unit.images)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/dashboard/admin/properties/${unit.propertyId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la propiedad
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Unidad {unit.unitNumber}</h1>
            <p className="text-gray-600 mt-1">
              {unit.property.name} · {unit.property.city}, {unit.property.neighborhood}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {unitStatusLabel[unit.status]}
            </span>
            <UnitActions unitId={unit.id} propertyId={unit.propertyId} initialForm={initialForm} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Información de la unidad</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="font-medium text-gray-900">{unit.area != null ? `${unit.area} m²` : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Piso</p>
                  <p className="font-medium text-gray-900">{unit.floor ?? '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Habitaciones</p>
                  <p className="font-medium text-gray-900">{unit.bedrooms}</p>
                </div>
                <div>
                  <p className="text-gray-500">Baños</p>
                  <p className="font-medium text-gray-900">{unit.bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-500">Canon base</p>
                  <p className="font-medium text-gray-900">{formatMoney(unit.baseRent)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Depósito</p>
                  <p className="font-medium text-gray-900">{formatMoney(unit.deposit)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Características y servicios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amoblado</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.furnished)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Balcón</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.balcony)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Parqueadero</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.parking)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Depósito</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.storage)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pet friendly</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.petFriendly)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fumar permitido</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.smokingAllowed)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Internet</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.internet)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cable TV</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.cableTV)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Agua incluida</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.waterIncluded)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gas incluido</p>
                  <p className="font-medium text-gray-900">{formatBool(unit.gasIncluded)}</p>
                </div>
              </div>
              {unit.description && <p className="text-sm text-gray-600 mt-4">{unit.description}</p>}
            </div>

            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Contratos</h2>
              </div>
              {unit.contracts.length === 0 ? (
                <p className="text-sm text-gray-600">No hay contratos asociados a esta unidad.</p>
              ) : (
                <div className="space-y-6">
                  {unit.contracts.map((contract) => (
                    <div key={contract.id} className="rounded-lg border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Contrato {contract.id.slice(0, 8)}</p>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {contractStatusLabel[contract.status]}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Inquilino</p>
                          <p className="font-medium text-gray-900">
                            {contract.tenant?.user?.name} {contract.tenant?.user?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Admins</p>
                          <p className="font-medium text-gray-900">
                            {contract.admins.length
                              ? contract.admins.map((admin) => `${admin.user?.name ?? ''} ${admin.user?.lastName ?? ''}`.trim()).join(', ')
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Inicio</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fin</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Canon</p>
                          <p className="font-medium text-gray-900">{formatMoney(contract.rent)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Depósito</p>
                          <p className="font-medium text-gray-900">{formatMoney(contract.deposit)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Prioridad</p>
                          <p className="font-medium text-gray-900">{contractPriorityLabel[contract.priority]}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Auto-renovación</p>
                          <p className="font-medium text-gray-900">{formatBool(contract.autoRenewal)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Documentos del proceso</p>
                          <p className="font-medium text-gray-900">{contract.processDocuments ? 'Sí' : 'No'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Residentes adicionales</p>
                          <p className="font-medium text-gray-900">{contract.additionalResidents.length || 0}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-gray-500">Notas</p>
                          <p className="font-medium text-gray-900">{contract.notes || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Términos</p>
                          <p className="font-medium text-gray-900">{contract.terms || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Motivo rechazo</p>
                          <p className="font-medium text-gray-900">{contract.rejectionReason || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Motivo cancelación</p>
                          <p className="font-medium text-gray-900">{contract.cancellationReason || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Iniciado</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.initiatedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revisado</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.reviewedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Aprobado</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.approvedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Firmado</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.signedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Activado</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.activatedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Terminado</p>
                          <p className="font-medium text-gray-900">{formatDate(contract.terminatedAt)}</p>
                        </div>
                      </div>

                      {contract.payments.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Pagos</p>
                          <div className="space-y-2">
                            {contract.payments.map((payment) => (
                              <div key={payment.id} className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                <span className="font-medium text-gray-900">{paymentTypeLabel[payment.paymentType]}</span>
                                <span>{formatMoney(payment.amount)}</span>
                                <span>Vence: {formatDate(payment.dueDate)}</span>
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {paymentStatusLabel[payment.status]}
                                </span>
                                {payment.paidDate && <span>Pagado: {formatDate(payment.paidDate)}</span>}
                                {payment.reference && <span>Ref: {payment.reference}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Propiedad</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-900">{unit.property.name}</p>
                <p>
                  {unit.property.street} {unit.property.number}
                </p>
                <p>
                  {unit.property.city}, {unit.property.neighborhood}
                </p>
                <p>{unit.property.state}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Imágenes</h2>
              {images.length === 0 ? (
                <p className="text-sm text-gray-600">No hay imágenes registradas.</p>
              ) : (
                <div className="space-y-2 text-xs text-gray-600">
                  {images.map((url) => (
                    <div key={url} className="truncate">
                      {url}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
