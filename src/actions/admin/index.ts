'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '+/lib/prisma'

export interface CreateAdminInput {
  email: string
  adminLevel: 'SUPER_ADMIN' | 'MANAGER' | 'STANDARD' | 'LIMITED'
  temporaryPassword: string
  createdById?: string
  name: string
  lastName: string
  phone?: string
  birthDate?: string
  birthPlace?: string
  profession?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'COMMON_LAW'
  documentType: 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT' | 'OTHER'
  documentNumber: string
  address?: string
  city?: string
  state?: string
  country: string
  postalCode?: string
  timezone: string
  language: 'es' | 'en' | 'pt'
  emailNotifications: boolean
  smsNotifications: boolean
}

const createAdminCommand = async (data: CreateAdminInput) => {
  try {
    const hashedPassword = await bcrypt.hash(data.temporaryPassword, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          lastName: data.lastName,
          phone: data.phone,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          birthPlace: data.birthPlace,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          documentType: data.documentType,
          documentNumber: data.documentNumber,
          gender: data.gender,
          maritalStatus: data.maritalStatus,
          profession: data.profession,
          timezone: data.timezone,
          language: data.language,
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
          password: hashedPassword,
        },
      })

      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          adminLevel: data.adminLevel,
          createdById: data.createdById,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              lastName: true,
              phone: true,
              documentType: true,
              documentNumber: true,
              createdAt: true,
            },
          },
        },
      })

      return admin
    })

    return result
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[]
        if (target?.includes('email')) throw new Error('El email ya está registrado')
        if (target?.includes('documentNumber')) throw new Error('El número de documento ya está registrado')
      }
    }
    throw error
  }
}

export const createAdmin = async (data: CreateAdminInput) => {
  try {
    if (!data.email || !data.name || !data.lastName || !data.documentNumber || !data.temporaryPassword)
      return {
        success: false,
        error: 'Faltan campos requeridos',
      }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email))
      return {
        success: false,
        error: 'Formato de email inválido',
      }

    if (data.temporaryPassword.length < 8)
      return {
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres',
      }

    const admin = await createAdminCommand(data)

    revalidatePath('/admin/users')
    revalidatePath('/admin/admins')

    return {
      success: true,
      data: admin,
      message: 'Administrador creado exitosamente',
    }
  } catch (error) {
    console.error('Error al crear administrador:', error)

    if (error instanceof Error)
      return {
        success: false,
        error: error.message,
      }

    return {
      success: false,
      error: 'Error interno del servidor. Intente nuevamente.',
    }
  }
}
