import type { CaseKind, CaseStatus } from '+/generated/prisma/client'

export const caseKindLabel: Record<CaseKind, string> = {
  PROBLEM: 'Problema en la unidad',
  PETITION: 'Petición',
  COMPLAINT: 'Queja',
  CLAIM: 'Reclamo',
  SUGGESTION: 'Sugerencia',
}

export const caseStatusConfig: Record<CaseStatus, { label: string; box: string }> = {
  OPEN: { label: 'Nuevo', box: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  IN_PROGRESS: { label: 'En atención', box: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  RESOLVED: { label: 'Resuelto', box: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  CLOSED: { label: 'Cerrado', box: 'bg-gray-100 text-gray-700 ring-gray-500/20' },
}
