import type { ProcessStatus } from '@prisma/client'

// Etiqueta + estilo por estado de proceso de alquiler. Reutilizable en admin/tenant.
export const processStatusConfig: Record<ProcessStatus, { label: string; box: string }> = {
  IN_PROGRESS: { label: 'En progreso', box: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  IN_EVALUATION: { label: 'En evaluación', box: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' },
  WAITING_FOR_FEEDBACK: { label: 'Esperando respuesta', box: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  APPROVED: { label: 'Aprobado', box: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  DISAPPROVED: { label: 'Rechazado', box: 'bg-red-50 text-red-700 ring-red-600/20' },
}
