import { randomUUID } from 'node:crypto'
import { compare, hash } from 'bcryptjs'

import type { Prisma } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'

const CREDENTIAL_PROVIDER = 'credential'
const SALT_ROUNDS = 10

export const hashPassword = (password: string) => hash(password, SALT_ROUNDS)

export const verifyPassword = ({ hash: storedHash, password }: { hash: string; password: string }) => compare(password, storedHash)

// Datos para un `user.create` con su cuenta de credenciales (la contraseña ya viene hasheada).
// Better Auth exige que accountId de la cuenta de credenciales sea el id del usuario, por eso se fija el id aquí.
export const credentialAccount = (passwordHash: string) => {
  const id = randomUUID()
  return { id, accounts: { create: { accountId: id, providerId: CREDENTIAL_PROVIDER, password: passwordHash } } }
}

// Crea o reemplaza la contraseña de un usuario existente.
export const setCredentialPassword = async (userId: string, passwordHash: string, client: Prisma.TransactionClient | typeof prisma = prisma) => {
  const existing = await client.account.findFirst({
    where: { userId, providerId: CREDENTIAL_PROVIDER },
    select: { id: true },
  })

  if (existing) {
    await client.account.update({ where: { id: existing.id }, data: { accountId: userId, password: passwordHash } })
    return
  }

  await client.account.create({
    data: { userId, accountId: userId, providerId: CREDENTIAL_PROVIDER, password: passwordHash },
  })
}
