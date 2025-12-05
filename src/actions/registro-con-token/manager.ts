import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import bcrypt from 'bcryptjs'

export class ResitroConToken {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    this.prisma = prisma
  }

  async validateRegistrationToken(token: string) {
    try {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          registrationToken: token,
          registrationTokenExpires: { gte: new Date() },
        },
        select: {
          id: true,
          userId: true,
          user: { select: { name: true, lastName: true, email: true, password: true } },
        },
      })

      if (!tenant) throw new Error('Token inválido o expirado')

      return tenant
    } catch (error) {
      console.error(`❌ Error validando token:`, error)
      throw error
    }
  }

  async completeUserRegistration({ token, password }: { token: string; password: string }) {
    try {
      const tenant = await this.validateRegistrationToken(token)

      const hashedPassword = await bcrypt.hash(password, 10)

      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          registrationToken: null,
          registrationTokenExpires: null,
          user: { update: { password: hashedPassword } },
        },
      })

      return tenant
    } catch (error) {
      console.error(`❌ Error completando registro:`, error)

      if (error instanceof Error) {
        throw new Error(`No se pudo completar el registro: ${error.message}`)
      }

      throw new Error('Error desconocido completando el registro')
    }
  }
}

export const resitroConToken = new ResitroConToken(new PrismaClient())

export type TenantValidationRegistrationToken = Prisma.PromiseReturnType<
  typeof ResitroConToken.prototype.validateRegistrationToken
>

export type RegistrationCompletionResult = Prisma.PromiseReturnType<
  typeof ResitroConToken.prototype.completeUserRegistration
>
