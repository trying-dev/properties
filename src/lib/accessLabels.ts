import type { AccessDeviceKind, AccessDeviceStatus, AccessRequestKind, AccessRequestStatus, PackageStatus } from '+/generated/prisma/client'

export const accessKindLabel: Record<AccessRequestKind, string> = {
  VISIT: 'Visitante',
  MOVE: 'Mudanza',
  WORKS: 'Remodelación u obra',
  CONTRACTOR: 'Contratista o proveedor',
  EVENT: 'Evento',
}

export const accessStatusConfig: Record<AccessRequestStatus, { label: string; box: string }> = {
  PENDING: { label: 'Por autorizar', box: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  APPROVED: { label: 'Autorizada', box: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  REJECTED: { label: 'Rechazada', box: 'bg-red-50 text-red-700 ring-red-600/20' },
  CANCELLED: { label: 'Cancelada', box: 'bg-gray-100 text-gray-700 ring-gray-500/20' },
}

export const packageStatusLabel: Record<PackageStatus, string> = {
  RECEIVED: 'En administración',
  DELIVERED: 'Entregado',
}

export const deviceKindLabel: Record<AccessDeviceKind, string> = {
  KEY: 'Llave',
  CARD: 'Tarjeta',
  REMOTE: 'Control remoto',
}

export const deviceStatusLabel: Record<AccessDeviceStatus, string> = {
  DELIVERED: 'Entregada',
  RETURNED: 'Devuelta',
  LOST: 'Perdida',
}
