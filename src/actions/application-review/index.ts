'use server'

import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import {
  NotificationType,
  Prisma,
  ProcessDocumentUploaderRole,
  ProcessReviewStatus,
  ProcessReviewTargetType,
  ProcessStatus,
} from '@prisma/client'

import { sendSystemNotificationAction } from '+/actions/notifications'
import { auth } from '+/lib/auth'
import { resolveEmailTargets } from '+/lib/email'
import { prisma } from '+/lib/prisma'

type SessionContext = {
  userId: string
  adminId: string | null
  tenantId: string | null
  role: 'admin' | 'tenant'
}

type ProcessAccess = {
  id: string
  tenantId: string | null
}

type ProcessDocumentFileInput = {
  fileName: string
  filePath: string
  fileType?: string | null
  fileSize?: number | null
}

type CreateProcessDocumentVersionInput = {
  processId: string
  documentType: string
  label: string
  files: ProcessDocumentFileInput[]
}

type UpsertProcessReviewItemInput = {
  processId: string
  targetType: ProcessReviewTargetType
  targetId: string
  status: ProcessReviewStatus
  documentId?: string | null
  adminComment?: string | null
}

type SubmitTenantReviewResponseInput = {
  processId: string
  targetType: ProcessReviewTargetType
  targetId: string
  tenantResponse: string
}

type RequestProcessFeedbackInput = {
  processId: string
  message?: string | null
}

type SetProcessDecisionInput = {
  processId: string
  status: typeof ProcessStatus.APPROVED | typeof ProcessStatus.DISAPPROVED
  conditions?: string | null
  message?: string | null
}

const resend = new Resend(process.env.RESEND_API_KEY)

const trimOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const getSessionContext = async (): Promise<{ success: true; data: SessionContext } | { success: false; error: string }> => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'Usuario no autenticado' }

  const [admin, tenant] = await Promise.all([
    prisma.admin.findUnique({ where: { userId }, select: { id: true } }),
    prisma.tenant.findUnique({ where: { userId }, select: { id: true } }),
  ])

  if (admin) {
    return { success: true, data: { userId, adminId: admin.id, tenantId: tenant?.id ?? null, role: 'admin' } }
  }
  if (tenant) {
    return { success: true, data: { userId, adminId: null, tenantId: tenant.id, role: 'tenant' } }
  }

  return { success: false, error: 'Usuario sin rol válido' }
}

const requireAdminContext = async () => {
  const context = await getSessionContext()
  if (!context.success) return context
  if (context.data.role !== 'admin' || !context.data.adminId) {
    return { success: false as const, error: 'Solo administradores pueden revisar aplicaciones' }
  }
  return context
}

const getAccessibleProcess = async (
  processId: string,
  context: SessionContext
): Promise<{ success: true; data: ProcessAccess } | { success: false; error: string }> => {
  const process = await prisma.process.findUnique({
    where: { id: processId },
    select: { id: true, tenantId: true },
  })

  if (!process) return { success: false, error: 'Proceso no encontrado' }
  if (context.role === 'admin') return { success: true, data: process }
  if (context.tenantId && process.tenantId === context.tenantId) return { success: true, data: process }

  return { success: false, error: 'Sin acceso a este proceso' }
}

const sendFeedbackEmail = async ({
  tenantEmail,
  tenantName,
  processId,
  message,
}: {
  tenantEmail?: string | null
  tenantName: string
  processId: string
  message?: string | null
}) => {
  const emailTarget = resolveEmailTargets(tenantEmail)
  if (!emailTarget.ok) return { sent: false, error: emailTarget.error }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const processUrl = appUrl ? `${appUrl}/dashboard/tenant/processes` : null
  const safeName = escapeHtml(tenantName || 'Hola')
  const safeMessage = message ? escapeHtml(message) : null

  await resend.emails.send({
    from: emailTarget.from,
    to: emailTarget.to,
    subject: 'Necesitamos información adicional para tu solicitud',
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px;">
          <h1 style="font-size: 22px; margin: 0 0 12px;">${safeName}</h1>
          <p style="font-size: 14px; line-height: 1.6; margin: 0 0 14px;">
            Necesitamos que revises algunos puntos de tu solicitud de arriendo.
          </p>
          ${
            safeMessage
              ? `<p style="font-size: 14px; line-height: 1.6; background: #f3f4f6; border-radius: 8px; padding: 12px; margin: 0 0 16px;">${safeMessage}</p>`
              : ''
          }
          ${
            processUrl
              ? `<p style="margin: 18px 0;"><a href="${processUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 11px 16px; border-radius: 8px; font-size: 14px;">Ver solicitud</a></p>`
              : ''
          }
          <p style="font-size: 12px; color: #6b7280; margin: 18px 0 0;">Proceso ${escapeHtml(processId)}</p>
        </div>
      </div>
    `,
  })

  return { sent: true, error: null }
}

export const createProcessDocumentVersionAction = async (input: CreateProcessDocumentVersionInput) => {
  const processId = input.processId?.trim()
  const documentType = input.documentType?.trim()
  const label = input.label?.trim()
  const files = input.files ?? []

  if (!processId) return { success: false, error: 'Falta processId' }
  if (!documentType) return { success: false, error: 'Falta documentType' }
  if (!label) return { success: false, error: 'Falta label' }
  if (files.length === 0) return { success: false, error: 'Agrega al menos un archivo' }

  const invalidFile = files.find((file) => !file.fileName?.trim() || !file.filePath?.trim())
  if (invalidFile) return { success: false, error: 'Todos los archivos requieren nombre y ruta' }

  try {
    const context = await getSessionContext()
    if (!context.success) return context

    const process = await getAccessibleProcess(processId, context.data)
    if (!process.success) return process

    const documents = await prisma.$transaction(async (tx) => {
      const latest = await tx.processDocument.aggregate({
        where: { processId, documentType },
        _max: { version: true },
      })
      const nextVersion = (latest._max.version ?? 0) + 1

      await tx.processDocument.updateMany({
        where: { processId, documentType, isLatest: true },
        data: { isLatest: false },
      })

      return Promise.all(
        files.map((file) =>
          tx.processDocument.create({
            data: {
              processId,
              documentType,
              label,
              fileName: file.fileName.trim(),
              filePath: file.filePath.trim(),
              fileType: trimOrNull(file.fileType),
              fileSize: file.fileSize ?? null,
              version: nextVersion,
              isLatest: true,
              uploadedByRole:
                context.data.role === 'admin' ? ProcessDocumentUploaderRole.ADMIN : ProcessDocumentUploaderRole.TENANT,
              uploadedByUserId: context.data.userId,
            },
          })
        )
      )
    })

    revalidatePath(`/dashboard/admin/applications/${processId}`)
    revalidatePath('/dashboard/tenant/processes')

    return { success: true, data: documents }
  } catch (error) {
    console.error('Error en createProcessDocumentVersionAction:', error)
    return { success: false, error: 'No se pudo registrar la versión del documento' }
  }
}

export const getProcessReviewBundleAction = async (processId: string) => {
  const trimmedProcessId = processId?.trim()
  if (!trimmedProcessId) return { success: false, error: 'Falta processId' }

  try {
    const context = await getSessionContext()
    if (!context.success) return context

    const processAccess = await getAccessibleProcess(trimmedProcessId, context.data)
    if (!processAccess.success) return processAccess

    const process = await prisma.process.findUnique({
      where: { id: trimmedProcessId },
      select: {
        id: true,
        status: true,
        approvalConditions: true,
        documents: {
          orderBy: [{ documentType: 'asc' }, { version: 'desc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            documentType: true,
            label: true,
            fileName: true,
            filePath: true,
            fileType: true,
            fileSize: true,
            version: true,
            isLatest: true,
            uploadedByRole: true,
            uploadedByUserId: true,
            createdAt: true,
            uploadedBy: { select: { name: true, lastName: true, email: true } },
          },
        },
        reviewItems: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            documentId: true,
            targetType: true,
            targetId: true,
            status: true,
            adminComment: true,
            tenantResponse: true,
            reviewedAt: true,
            updatedAt: true,
            reviewedByAdmin: {
              select: {
                id: true,
                user: { select: { name: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
    })

    if (!process) return { success: false, error: 'Proceso no encontrado' }
    return { success: true, data: process }
  } catch (error) {
    console.error('Error en getProcessReviewBundleAction:', error)
    return { success: false, error: 'No se pudo cargar la revisión de la aplicación' }
  }
}

export type ProcessReviewBundle = NonNullable<Awaited<ReturnType<typeof getProcessReviewBundleAction>>['data']>

export const upsertProcessReviewItemAction = async (input: UpsertProcessReviewItemInput) => {
  const processId = input.processId?.trim()
  const targetId = input.targetId?.trim()

  if (!processId) return { success: false, error: 'Falta processId' }
  if (!targetId) return { success: false, error: 'Falta targetId' }

  try {
    const context = await requireAdminContext()
    if (!context.success) return context

    const process = await getAccessibleProcess(processId, context.data)
    if (!process.success) return process

    const documentId = trimOrNull(input.documentId)
    if (documentId) {
      const document = await prisma.processDocument.findFirst({
        where: { id: documentId, processId },
        select: { id: true },
      })
      if (!document) return { success: false, error: 'Documento no encontrado para este proceso' }
    }

    const reviewedAt = input.status === ProcessReviewStatus.PENDING ? null : new Date()
    const item = await prisma.processReviewItem.upsert({
      where: {
        processId_targetType_targetId: {
          processId,
          targetType: input.targetType,
          targetId,
        },
      },
      create: {
        processId,
        documentId,
        targetType: input.targetType,
        targetId,
        status: input.status,
        adminComment: trimOrNull(input.adminComment),
        reviewedByAdminId: context.data.adminId,
        reviewedAt,
      },
      update: {
        documentId,
        status: input.status,
        adminComment: trimOrNull(input.adminComment),
        reviewedByAdminId: context.data.adminId,
        reviewedAt,
      },
    })

    revalidatePath(`/dashboard/admin/applications/${processId}`)
    return { success: true, data: item }
  } catch (error) {
    console.error('Error en upsertProcessReviewItemAction:', error)
    return { success: false, error: 'No se pudo guardar el item de revisión' }
  }
}

export const submitTenantReviewResponseAction = async (input: SubmitTenantReviewResponseInput) => {
  const processId = input.processId?.trim()
  const targetId = input.targetId?.trim()
  const tenantResponse = input.tenantResponse?.trim()

  if (!processId) return { success: false, error: 'Falta processId' }
  if (!targetId) return { success: false, error: 'Falta targetId' }
  if (!tenantResponse) return { success: false, error: 'Escribe una respuesta' }

  try {
    const context = await getSessionContext()
    if (!context.success) return context
    if (context.data.role !== 'tenant') return { success: false, error: 'Solo el inquilino puede responder feedback' }

    const process = await getAccessibleProcess(processId, context.data)
    if (!process.success) return process

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.processReviewItem.update({
        where: {
          processId_targetType_targetId: {
            processId,
            targetType: input.targetType,
            targetId,
          },
        },
        data: {
          tenantResponse,
          status: ProcessReviewStatus.PENDING,
          reviewedAt: null,
        },
      })

      const remainingFeedbackItems = await tx.processReviewItem.count({
        where: { processId, status: ProcessReviewStatus.NEEDS_FEEDBACK },
      })

      if (remainingFeedbackItems === 0) {
        await tx.process.update({
          where: { id: processId },
          data: { status: ProcessStatus.IN_EVALUATION },
        })
      }

      return item
    })

    revalidatePath('/dashboard/tenant/processes')
    revalidatePath(`/dashboard/admin/applications/${processId}`)

    return { success: true, data: result }
  } catch (error) {
    console.error('Error en submitTenantReviewResponseAction:', error)
    return { success: false, error: 'No se pudo guardar la respuesta' }
  }
}

export const requestProcessFeedbackAction = async (input: RequestProcessFeedbackInput) => {
  const processId = input.processId?.trim()
  if (!processId) return { success: false, error: 'Falta processId' }

  try {
    const context = await requireAdminContext()
    if (!context.success) return context

    const process = await prisma.process.findUnique({
      where: { id: processId },
      select: {
        id: true,
        tenantId: true,
        tenant: { select: { user: { select: { email: true, name: true, lastName: true } } } },
      },
    })

    if (!process) return { success: false, error: 'Proceso no encontrado' }

    await prisma.process.update({
      where: { id: processId },
      data: { status: ProcessStatus.WAITING_FOR_FEEDBACK },
    })

    const message = trimOrNull(input.message) ?? 'Tienes comentarios pendientes para completar tu solicitud.'
    if (process.tenantId) {
      await sendSystemNotificationAction({
        tenantId: process.tenantId,
        type: NotificationType.REMINDER,
        title: 'Tu solicitud requiere ajustes',
        body: message,
        link: '/dashboard/tenant/processes',
      })
    }

    let emailSent = false
    let emailError: string | null = null
    const tenantName = [process.tenant?.user.name, process.tenant?.user.lastName].filter(Boolean).join(' ')
    try {
      const emailResult = await sendFeedbackEmail({
        tenantEmail: process.tenant?.user.email,
        tenantName,
        processId,
        message,
      })
      emailSent = emailResult.sent
      emailError = emailResult.error
    } catch (emailException) {
      console.error('Error enviando email de feedback:', emailException)
      emailError = 'No se pudo enviar el correo de feedback'
    }

    revalidatePath(`/dashboard/admin/applications/${processId}`)
    revalidatePath('/dashboard/tenant/processes')

    return { success: true, data: { emailSent, emailError } }
  } catch (error) {
    console.error('Error en requestProcessFeedbackAction:', error)
    return { success: false, error: 'No se pudo solicitar feedback' }
  }
}

export const setProcessDecisionAction = async (input: SetProcessDecisionInput) => {
  const processId = input.processId?.trim()
  if (!processId) return { success: false, error: 'Falta processId' }
  if (![ProcessStatus.APPROVED, ProcessStatus.DISAPPROVED].includes(input.status)) {
    return { success: false, error: 'Estado de decisión inválido' }
  }

  try {
    const context = await requireAdminContext()
    if (!context.success) return context

    const process = await prisma.process.findUnique({
      where: { id: processId },
      select: {
        id: true,
        tenantId: true,
        unit: { select: { unitNumber: true, property: { select: { name: true } } } },
      },
    })

    if (!process) return { success: false, error: 'Proceso no encontrado' }

    const isApproved = input.status === ProcessStatus.APPROVED
    const conditions = trimOrNull(input.conditions)

    await prisma.process.update({
      where: { id: processId },
      data: {
        status: input.status,
        approvalConditions: isApproved ? conditions : null,
        notes: !isApproved ? trimOrNull(input.message) : undefined,
      } satisfies Prisma.ProcessUpdateInput,
    })

    if (process.tenantId) {
      const propertyName = process.unit?.property?.name ?? 'la propiedad'
      const unitLabel = process.unit?.unitNumber ? `Unidad ${process.unit.unitNumber}` : 'la unidad'
      const defaultBody = isApproved
        ? `Tu solicitud para ${propertyName} (${unitLabel}) fue aprobada.`
        : `Tu solicitud para ${propertyName} (${unitLabel}) fue denegada.`
      const body = trimOrNull(input.message) ?? defaultBody

      await sendSystemNotificationAction({
        tenantId: process.tenantId,
        type: isApproved ? NotificationType.APPROVAL : NotificationType.REJECTION,
        title: isApproved ? 'Solicitud aprobada' : 'Solicitud denegada',
        body: conditions ? `${body} Condiciones: ${conditions}` : body,
        link: '/dashboard/tenant/processes',
      })
    }

    revalidatePath(`/dashboard/admin/applications/${processId}`)
    revalidatePath('/dashboard/admin/applications')
    revalidatePath('/dashboard/tenant/processes')

    return { success: true }
  } catch (error) {
    console.error('Error en setProcessDecisionAction:', error)
    return { success: false, error: 'No se pudo guardar la decisión' }
  }
}
