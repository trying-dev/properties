import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export class ProcessConfirmationManager {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    this.prisma = prisma
  }

  async getProcessDetails({ unitId, tenantId }: { unitId: string; tenantId: string }) {
    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId },
        include: { property: { include: { admin: { include: { user: true } } } } },
      })

      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { user: true },
      })

      if (!unit || !tenant) {
        throw new Error('Unidad o inquilino no encontrado')
      }

      return { unit, tenant }
    } catch (error) {
      throw error
    }
  }

  async initializeContract({
    unitId,
    tenantId,
    adminId,
    notes,
  }: {
    unitId: string
    tenantId: string
    adminId: string
    notes?: string
  }) {
    console.log({ unitId, tenantId, adminId, notes })

    try {
      // Verificar que la unidad existe y obtener sus datos
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId },
        select: {
          id: true,
          status: true,
          baseRent: true,
          deposit: true,
          unitNumber: true,
          property: { select: { name: true } },
        },
      })

      if (!unit) throw new Error('La unidad especificada no existe')
      if (!unit.baseRent) throw new Error('La unidad no tiene una renta base definida')

      // Verificar que el inquilino y admin existen
      const [tenant, userAdmin] = await Promise.all([
        this.prisma.tenant.findUnique({
          where: { id: tenantId },
          include: { user: { select: { name: true, lastName: true, email: true, password: true } } },
        }),
        this.prisma.user.findUnique({
          where: { id: adminId },
          select: { name: true, lastName: true, admin: { select: { id: true } } },
        }),
      ])

      if (!tenant) throw new Error('El inquilino especificado no existe')
      if (!userAdmin) throw new Error('El usuario administrador especificado no existe')
      if (!userAdmin.admin?.id) throw new Error('El usuario administrador especificado no tiene id')

      // Crear contrato inicial
      const contract = await this.prisma.contract.create({
        data: {
          unitId,
          tenantId,
          adminId: userAdmin.admin?.id,
          status: 'INITIATED', // Estado inicial del proceso
          notes,

          // Tomamos los valores de la unidad
          rent: unit.baseRent,
          deposit: unit.deposit || unit.baseRent, // Si no hay depósito, usar la renta como depósito

          // Fechas temporales (se definirán después cuando se active el contrato)
          startDate: new Date(), // Fecha temporal
          endDate: new Date(), // Fecha temporal

          initiatedAt: new Date(),
        },
        include: {
          unit: { include: { property: { select: { name: true } } } },
          tenant: {
            include: { user: { select: { name: true, lastName: true, email: true, password: true } } },
          },
        },
      })

      return {
        id: contract.id,
        unitId: contract.unitId,
        tenantId: contract.tenantId,
        adminId: contract.adminId,
        status: contract.status,
        notes: contract.notes,
        rent: contract.rent,
        deposit: contract.deposit,
        createdAt: contract.createdAt,
        // Datos adicionales para el response
        unit: contract.unit,
        tenant: contract.tenant,
        admin: userAdmin, // Directamente el user, no nested
      }
    } catch (error) {
      throw error
    }
  }

  async updateUserRegistrationToken(tenantId: string, registrationToken: string) {
    return await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        registrationToken,
        registrationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    })
  }
}

export const processConfirmationManager = new ProcessConfirmationManager(new PrismaClient())

export type ProcessDetails = Prisma.PromiseReturnType<
  typeof ProcessConfirmationManager.prototype.getProcessDetails
>
