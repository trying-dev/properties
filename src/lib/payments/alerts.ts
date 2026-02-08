import { NotificationSenderRole, NotificationType, PaymentStatus } from '@prisma/client'
import { prisma } from '+/lib/prisma'

const buildPaymentLink = (paymentId: string) => `/dashboard/tenant/units?paymentId=${paymentId}`

const formatDueDate = (value: Date) => value.toLocaleDateString('es-CO', { dateStyle: 'long' })

const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

export const generatePaymentAlerts = async (date = new Date()) => {
  const todayStart = getStartOfDay(date)
  const reminderEnd = addDays(todayStart, 3)

  const overduePayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PENDING,
      dueDate: { lt: todayStart },
    },
    include: {
      contract: {
        include: {
          admins: { select: { id: true } },
          tenant: { select: { id: true, user: { select: { name: true, lastName: true } } } },
          unit: { select: { unitNumber: true, property: { select: { name: true } } } },
        },
      },
    },
  })

  const overdueIds = overduePayments.map((payment) => payment.id)
  if (overdueIds.length > 0) {
    await prisma.payment.updateMany({
      where: { id: { in: overdueIds }, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.OVERDUE },
    })
  }

  const overdueLinks = overduePayments.map((payment) => buildPaymentLink(payment.id))
  const existingOverdue = overdueLinks.length
    ? await prisma.notification.findMany({
        where: {
          type: NotificationType.PAYMENT_OVERDUE,
          link: { in: overdueLinks },
        },
        select: { link: true, adminId: true, tenantId: true },
      })
    : []
  const existingOverdueTenantLinks = new Set(
    existingOverdue.filter((item) => item.tenantId).map((item) => item.link).filter(Boolean) as string[]
  )
  const existingOverdueAdminKeys = new Set(
    existingOverdue
      .filter((item) => item.adminId !== undefined)
      .map((item) => `${item.adminId ?? 'broadcast'}::${item.link}`)
  )

  let overdueNotified = 0
  for (const payment of overduePayments) {
    const tenantId = payment.contract?.tenantId
    if (!tenantId) continue

    const link = buildPaymentLink(payment.id)
    if (existingOverdueTenantLinks.has(link)) continue

    const propertyName = payment.contract?.unit?.property?.name ?? 'la propiedad'
    const unitLabel = payment.contract?.unit?.unitNumber ? `Unidad ${payment.contract.unit.unitNumber}` : 'la unidad'
    const tenantName = [payment.contract?.tenant?.user?.name, payment.contract?.tenant?.user?.lastName].filter(Boolean).join(' ')
    const dueDateLabel = formatDueDate(payment.dueDate)

    await prisma.notification.create({
      data: {
        tenantId,
        senderRole: NotificationSenderRole.SYSTEM,
        type: NotificationType.PAYMENT_OVERDUE,
        title: 'Pago vencido',
        body: `${tenantName ? `${tenantName}, ` : ''}tu pago de arriendo para ${propertyName} (${unitLabel}) venció el ${dueDateLabel}.`,
        link,
        metadata: { paymentId: payment.id },
      },
    })

    overdueNotified += 1

    const admins = payment.contract?.admins ?? []
    const adminTargets = admins.length > 0 ? admins.map((admin) => admin.id) : [null]
    const adminMessage = `Pago vencido sin registrar para ${propertyName} (${unitLabel}) del ${dueDateLabel}.`
    for (const adminId of adminTargets) {
      const key = `${adminId ?? 'broadcast'}::${link}`
      if (existingOverdueAdminKeys.has(key)) continue
      await prisma.notification.create({
        data: {
          adminId,
          senderRole: NotificationSenderRole.SYSTEM,
          type: NotificationType.PAYMENT_OVERDUE,
          title: 'Pago vencido sin registrar',
          body: `${adminMessage}${tenantName ? ` Inquilino: ${tenantName}.` : ''}`,
          link,
          metadata: { paymentId: payment.id },
        },
      })
    }
  }

  const reminderPayments = await prisma.payment.findMany({
    where: {
      status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      dueDate: { gte: todayStart, lt: reminderEnd },
    },
    include: {
      contract: {
        include: {
          tenant: { select: { id: true, user: { select: { name: true, lastName: true } } } },
          unit: { select: { unitNumber: true, property: { select: { name: true } } } },
        },
      },
    },
  })

  const reminderLinks = reminderPayments.map((payment) => buildPaymentLink(payment.id))
  const existingReminders = reminderLinks.length
    ? await prisma.notification.findMany({
        where: {
          type: NotificationType.REMINDER,
          link: { in: reminderLinks },
        },
        select: { link: true },
      })
    : []
  const existingReminderLinks = new Set(existingReminders.map((item) => item.link).filter(Boolean) as string[])

  let remindersSent = 0
  for (const payment of reminderPayments) {
    const tenantId = payment.contract?.tenantId
    if (!tenantId) continue

    const link = buildPaymentLink(payment.id)
    if (existingReminderLinks.has(link)) continue

    const propertyName = payment.contract?.unit?.property?.name ?? 'la propiedad'
    const unitLabel = payment.contract?.unit?.unitNumber ? `Unidad ${payment.contract.unit.unitNumber}` : 'la unidad'
    const tenantName = [payment.contract?.tenant?.user?.name, payment.contract?.tenant?.user?.lastName].filter(Boolean).join(' ')
    const dueDateLabel = formatDueDate(payment.dueDate)

    await prisma.notification.create({
      data: {
        tenantId,
        senderRole: NotificationSenderRole.SYSTEM,
        type: NotificationType.REMINDER,
        title: 'Recordatorio de pago',
        body: `${tenantName ? `${tenantName}, ` : ''}tu pago de arriendo para ${propertyName} (${unitLabel}) vence el ${dueDateLabel}.`,
        link,
        metadata: { paymentId: payment.id },
      },
    })

    remindersSent += 1
  }

  return {
    success: true,
    overdueUpdated: overdueIds.length,
    overdueNotified,
    remindersSent,
  }
}
