import type { DisciplineOutcome, DisciplineStatus, FaultSeverity } from '+/generated/prisma/client'

export const faultSeverityLabel: Record<FaultSeverity, string> = {
  VERY_LIGHT: 'Muy leve',
  LIGHT: 'Leve',
  MODERATE: 'Moderada',
  SERIOUS: 'Grave',
  VERY_SERIOUS: 'Muy grave',
}

export const disciplineStatusConfig: Record<DisciplineStatus, { label: string; box: string }> = {
  NOTIFIED: { label: 'Notificada', box: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  DEFENSE_RECEIVED: { label: 'Con descargos', box: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  DECIDED: { label: 'Decidida', box: 'bg-gray-100 text-gray-700 ring-gray-500/20' },
}

export const disciplineOutcomeLabel: Record<DisciplineOutcome, string> = {
  WARNING: 'Llamado de atención',
  CORRECTIVE_MEASURE: 'Medida correctiva',
  DISMISSED: 'Archivada sin sanción',
}
