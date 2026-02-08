'use server'

import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'
import { NotificationSenderRole, NotificationType } from '@prisma/client'

const getSessionUserId = async () => {
  const session = await auth()
  return session?.user.id ?? null
}

const getTenantContext = async () => {
  const userId = await getSessionUserId()
  if (!userId) return null
  return prisma.tenant.findUnique({
    where: { userId },
    select: { id: true },
  })
}

const getAdminContext = async () => {
  const userId = await getSessionUserId()
  if (!userId) return null
  return prisma.admin.findUnique({
    where: { userId },
    select: { id: true },
  })
}

export const getTenantNotificationsAction = async () => {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const notifications = await prisma.notification.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        adminId: true,
        type: true,
        title: true,
        body: true,
        link: true,
        senderRole: true,
        readAt: true,
        createdAt: true,
        admin: { select: { id: true, user: { select: { name: true, lastName: true, email: true } } } },
      },
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error('Error en getTenantNotificationsAction:', error)
    return { success: false, error: 'No se pudieron cargar las notificaciones' }
  }
}

export type TenantNotificationList = NonNullable<Awaited<ReturnType<typeof getTenantNotificationsAction>>['data']>
export type TenantNotificationItem = TenantNotificationList[number]

export const getAdminNotificationsAction = async () => {
  try {
    const admin = await getAdminContext()
    if (!admin) return { success: false, error: 'Usuario no autenticado' }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ adminId: admin.id }, { adminId: null, tenantId: null }],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        adminId: true,
        type: true,
        title: true,
        body: true,
        link: true,
        senderRole: true,
        readAt: true,
        createdAt: true,
        tenant: { select: { id: true, user: { select: { name: true, lastName: true, email: true } } } },
      },
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error('Error en getAdminNotificationsAction:', error)
    return { success: false, error: 'No se pudieron cargar las notificaciones' }
  }
}

export type AdminNotificationList = NonNullable<Awaited<ReturnType<typeof getAdminNotificationsAction>>['data']>
export type AdminNotificationItem = AdminNotificationList[number]

export const markNotificationReadAction = async (notificationId: string) => {
  if (!notificationId) return { success: false, error: 'Falta notificationId' }
  try {
    const userId = await getSessionUserId()
    if (!userId) return { success: false, error: 'Usuario no autenticado' }

    const [tenant, admin] = await Promise.all([
      prisma.tenant.findUnique({ where: { userId }, select: { id: true } }),
      prisma.admin.findUnique({ where: { userId }, select: { id: true } }),
    ])

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, tenantId: true, adminId: true },
    })

    if (!notification) return { success: false, error: 'Notificación no encontrada' }

    const isRecipient =
      (tenant && notification.tenantId === tenant.id) ||
      (admin && (notification.adminId === admin.id || (notification.adminId === null && notification.tenantId === null)))

    if (!isRecipient) return { success: false, error: 'Sin acceso a la notificación' }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
      select: { id: true },
    })

    return { success: true }
  } catch (error) {
    console.error('Error en markNotificationReadAction:', error)
    return { success: false, error: 'No se pudo marcar como leída' }
  }
}

type SendNotificationInput = {
  tenantId?: string
  body: string
  title?: string
  type?: NotificationType
  link?: string
}

export const sendNotificationAction = async (input: SendNotificationInput) => {
  const trimmedBody = input.body?.trim()
  if (!trimmedBody) return { success: false, error: 'El mensaje está vacío' }

  try {
    const userId = await getSessionUserId()
    if (!userId) return { success: false, error: 'Usuario no autenticado' }

    const [tenant, admin] = await Promise.all([
      prisma.tenant.findUnique({ where: { userId }, select: { id: true } }),
      prisma.admin.findUnique({ where: { userId }, select: { id: true } }),
    ])

    const senderRole = tenant ? NotificationSenderRole.TENANT : admin ? NotificationSenderRole.ADMIN : null
    if (!senderRole) return { success: false, error: 'Usuario sin rol válido' }

    let tenantId: string | null = null
    let adminId: string | null = null

    if (senderRole === NotificationSenderRole.ADMIN) {
      tenantId = input.tenantId?.trim() || null
      if (!tenantId) return { success: false, error: 'Selecciona un inquilino' }
      adminId = admin?.id ?? null
    } else {
      tenantId = tenant?.id ?? null
      adminId = null
    }

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        adminId,
        senderRole,
        senderUserId: userId,
        type: input.type ?? NotificationType.GENERAL,
        title: input.title?.trim() || null,
        body: trimmedBody,
        link: input.link?.trim() || null,
      },
      select: { id: true },
    })

    return { success: true, data: { notificationId: notification.id } }
  } catch (error) {
    console.error('Error en sendNotificationAction:', error)
    return { success: false, error: 'No se pudo enviar la notificación' }
  }
}

type SendSystemNotificationInput = {
  tenantId?: string
  adminId?: string | null
  body: string
  title?: string
  type?: NotificationType
  link?: string
}

export const sendSystemNotificationAction = async (input: SendSystemNotificationInput) => {
  const trimmedBody = input.body?.trim()
  if (!trimmedBody) return { success: false, error: 'El mensaje está vacío' }

  try {
    const notificationsToCreate: Array<{ tenantId?: string | null; adminId?: string | null }> = []

    if (input.tenantId) {
      notificationsToCreate.push({ tenantId: input.tenantId, adminId: null })
    }
    if (input.adminId) {
      notificationsToCreate.push({ tenantId: null, adminId: input.adminId })
    }

    if (notificationsToCreate.length === 0) {
      return { success: false, error: 'Define un destinatario' }
    }

    const created = await Promise.all(
      notificationsToCreate.map((target) =>
        prisma.notification.create({
          data: {
            tenantId: target.tenantId ?? null,
            adminId: target.adminId ?? null,
            senderRole: NotificationSenderRole.SYSTEM,
            type: input.type ?? NotificationType.GENERAL,
            title: input.title?.trim() || null,
            body: trimmedBody,
            link: input.link?.trim() || null,
          },
          select: { id: true },
        })
      )
    )

    return { success: true, data: { notificationIds: created.map((item) => item.id) } }
  } catch (error) {
    console.error('Error en sendSystemNotificationAction:', error)
    return { success: false, error: 'No se pudo enviar la notificación del sistema' }
  }
}
