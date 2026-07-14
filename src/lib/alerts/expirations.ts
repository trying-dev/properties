import {
  MaintenanceStatus,
  NotificationSenderRole,
  NotificationType,
  PolicyStatus,
  TaxStatus,
} from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'

// Ventana por defecto: se avisa lo que vence dentro de los próximos 30 días
// (o ya está vencido).
export const DEFAULT_WINDOW_DAYS = 30

export type ExpirationSource = 'POLICY' | 'SECURITY' | 'DOCUMENT' | 'MAINTENANCE' | 'TAX'

export type ExpirationItem = {
  source: ExpirationSource
  id: string
  propertyId: string
  propertyName: string
  adminIds: string[]
  title: string
  detail: string
  date: Date // Fecha de vencimiento/servicio relevante
  daysLeft: number // Negativo = vencido
  link: string
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
const daysBetween = (from: Date, to: Date) => Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)
const ymd = (d: Date) => startOfDay(d).toISOString().slice(0, 10)

// Escanea las cinco fuentes con fecha de vencimiento y devuelve los ítems que
// vencen dentro de la ventana (o ya vencidos). Derivado, no escribe nada.
export const scanExpirations = async (date = new Date(), windowDays = DEFAULT_WINDOW_DAYS): Promise<ExpirationItem[]> => {
  const today = startOfDay(date)
  const horizon = addDays(today, windowDays)

  const items: ExpirationItem[] = []
  const push = (
    source: ExpirationSource,
    id: string,
    propertyId: string,
    propertyName: string,
    adminIds: string[],
    title: string,
    detail: string,
    when: Date,
    basePath: string,
  ) => {
    items.push({
      source,
      id,
      propertyId,
      propertyName,
      adminIds,
      title,
      detail,
      date: when,
      daysLeft: daysBetween(today, when),
      link: `${basePath}?id=${id}&due=${ymd(when)}`,
    })
  }

  // 1. Pólizas de seguro vigentes cuya vigencia termina en la ventana (F5c).
  const policies = await prisma.insurancePolicy.findMany({
    where: { status: PolicyStatus.ACTIVE, endDate: { lt: horizon } },
    include: { property: { select: { id: true, name: true, admins: { select: { id: true } } } } },
  })
  for (const p of policies) {
    push('POLICY', p.id, p.propertyId, p.property.name, p.property.admins.map((a) => a.id), 'Póliza por vencer', `${p.insurer} · ${p.policyNumber}`, p.endDate, '/dashboard/admin/insurance')
  }

  // 2. Dispositivos de seguridad activos con próxima recarga/servicio en la ventana (F4).
  const devices = await prisma.securityDevice.findMany({
    where: { active: true, nextServiceDate: { not: null, lt: horizon } },
    include: { property: { select: { id: true, name: true, admins: { select: { id: true } } } } },
  })
  for (const d of devices) {
    if (!d.nextServiceDate) continue
    push('SECURITY', d.id, d.propertyId, d.property.name, d.property.admins.map((a) => a.id), 'Servicio de seguridad', `${d.type}${d.location ? ` · ${d.location}` : ''}`, d.nextServiceDate, '/dashboard/admin/security')
  }

  // 3. Documentos legales con vencimiento en la ventana (F4).
  const docs = await prisma.propertyDocument.findMany({
    where: { expiryDate: { not: null, lt: horizon } },
    include: { property: { select: { id: true, name: true, admins: { select: { id: true } } } } },
  })
  for (const doc of docs) {
    if (!doc.expiryDate) continue
    push('DOCUMENT', doc.id, doc.propertyId, doc.property.name, doc.property.admins.map((a) => a.id), 'Documento por vencer', `${doc.type} · ${doc.name}`, doc.expiryDate, '/dashboard/admin/documents')
  }

  // 4. Mantenimientos preventivos con próxima fecha programada en la ventana (F2).
  const maints = await prisma.maintenance.findMany({
    where: { nextDueDate: { not: null, lt: horizon }, status: { not: MaintenanceStatus.CANCELLED } },
    include: { unit: { select: { propertyId: true, unitNumber: true, property: { select: { name: true, admins: { select: { id: true } } } } } } },
  })
  for (const m of maints) {
    if (!m.nextDueDate) continue
    push('MAINTENANCE', m.id, m.unit.propertyId, m.unit.property.name, m.unit.property.admins.map((a) => a.id), 'Mantenimiento preventivo', `${m.title} · Unidad ${m.unit.unitNumber}`, m.nextDueDate, '/dashboard/admin/maintenance')
  }

  // 5. Predial sin pagar con fecha límite en la ventana (F5a).
  const taxes = await prisma.propertyTax.findMany({
    where: { status: { in: [TaxStatus.PENDING, TaxStatus.OVERDUE] }, dueDate: { not: null, lt: horizon } },
    include: { property: { select: { id: true, name: true, admins: { select: { id: true } } } } },
  })
  for (const t of taxes) {
    if (!t.dueDate) continue
    push('TAX', t.id, t.propertyId, t.property.name, t.property.admins.map((a) => a.id), 'Predial por vencer', `Predial ${t.year}`, t.dueDate, '/dashboard/admin/property-tax')
  }

  // Más urgente primero (menos días restantes / ya vencido).
  return items.sort((a, b) => a.daysLeft - b.daysLeft)
}

// Genera notificaciones (tipo REMINDER) a los admins de cada propiedad por los
// vencimientos. Idempotente: dedupe por `link` (incluye el id y la fecha, así una
// renovación con nueva fecha vuelve a avisar). Se llama desde el cron diario.
export const generateExpirationAlerts = async (date = new Date(), windowDays = DEFAULT_WINDOW_DAYS) => {
  const items = await scanExpirations(date, windowDays)

  const links = items.map((i) => i.link)
  const existing = links.length
    ? await prisma.notification.findMany({
        where: { type: NotificationType.REMINDER, link: { in: links } },
        select: { link: true, adminId: true },
      })
    : []
  // Clave admin::link ya notificada.
  const done = new Set(existing.map((e) => `${e.adminId ?? 'broadcast'}::${e.link}`))

  let created = 0
  for (const item of items) {
    const targets = item.adminIds.length > 0 ? item.adminIds : [null]
    const overdue = item.daysLeft < 0
    const whenLabel = overdue
      ? `venció hace ${Math.abs(item.daysLeft)} d`
      : item.daysLeft === 0
        ? 'vence hoy'
        : `vence en ${item.daysLeft} d`

    for (const adminId of targets) {
      const key = `${adminId ?? 'broadcast'}::${item.link}`
      if (done.has(key)) continue
      await prisma.notification.create({
        data: {
          adminId,
          senderRole: NotificationSenderRole.SYSTEM,
          type: NotificationType.REMINDER,
          title: item.title,
          body: `${item.title} en ${item.propertyName}: ${item.detail} (${whenLabel}).`,
          link: item.link,
          metadata: { source: item.source, sourceId: item.id, date: ymd(item.date) },
        },
      })
      done.add(key)
      created += 1
    }
  }

  return { success: true, scanned: items.length, notified: created }
}
