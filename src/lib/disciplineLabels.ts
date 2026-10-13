import type { AppealOutcome, ComplianceStatus, DisciplineOutcome, DisciplineStatus, FaultSeverity } from '+/generated/prisma/client'

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
  APPEALED: { label: 'Con recurso', box: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
  CLOSED: { label: 'Cerrada', box: 'bg-slate-100 text-slate-700 ring-slate-500/20' },
}

export const disciplineOutcomeLabel: Record<DisciplineOutcome, string> = {
  WARNING: 'Llamado de atención',
  CORRECTIVE_MEASURE: 'Medida correctiva',
  DISMISSED: 'Archivada sin sanción',
}

export const appealOutcomeLabel: Record<AppealOutcome, string> = {
  UPHELD: 'Decisión confirmada',
  MODIFIED: 'Decisión modificada',
  REVOKED: 'Decisión revocada',
}

export const complianceStatusLabel: Record<ComplianceStatus, string> = {
  PENDING: 'Por verificar',
  COMPLIED: 'Cumplida',
  NOT_COMPLIED: 'Incumplida',
}
