import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import bcrypt from 'bcryptjs'

export class AdminManager {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    this.prisma = prisma
  }

  async createAdmin(data: CreateAdminInput) {
    try {
      const hashedPassword = await bcrypt.hash(data.temporaryPassword, 12)

      const result = await this.prisma.$transaction(async (tx) => {
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
}

export const adminManager = new AdminManager(new PrismaClient())

// Tipo para la entrada de datos del admin
export interface CreateAdminInput {
  // Información de acceso
  email: string
  adminLevel: 'SUPER_ADMIN' | 'MANAGER' | 'STANDARD' | 'LIMITED'
  temporaryPassword: string
  createdById?: string

  // Información personal
  name: string
  lastName: string
  phone?: string
  birthDate?: string
  birthPlace?: string
  profession?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'COMMON_LAW'

  // Documento de identidad
  documentType: 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT' | 'OTHER'
  documentNumber: string

  // Dirección
  address?: string
  city?: string
  state?: string
  country: string
  postalCode?: string

  // Configuraciones
  timezone: string
  language: 'es' | 'en' | 'pt'
  emailNotifications: boolean
  smsNotifications: boolean
}

// Tipo para el admin creado con relaciones
export type AdminWithUser = Prisma.PromiseReturnType<typeof AdminManager.prototype.createAdmin>
