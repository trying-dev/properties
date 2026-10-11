/**
 * Copia User.password a la tabla accounts (providerId 'credential') para los usuarios que aún no la tienen.
 * Better Auth exige accountId = id del usuario en la cuenta de credenciales.
 * Idempotente: se puede ejecutar varias veces. No modifica ni borra User.password.
 *
 * Uso: npx tsx scripts/migrate-credentials.ts
 */
import 'dotenv/config'
import { prisma } from '+/lib/prisma'

const run = async () => {
  const users = await prisma.user.findMany({
    where: { password: { not: null }, accounts: { none: { providerId: 'credential' } } },
    select: { id: true, email: true, password: true },
  })

  for (const user of users) {
    await prisma.account.create({
      data: { userId: user.id, accountId: user.id, providerId: 'credential', password: user.password },
    })
  }

  const credentials = await prisma.account.findMany({
    where: { providerId: 'credential' },
    select: { id: true, userId: true, accountId: true },
  })
  const mismatched = credentials.filter((account) => account.accountId !== account.userId)
  for (const account of mismatched) {
    await prisma.account.update({ where: { id: account.id }, data: { accountId: account.userId } })
  }
  const fixed = mismatched.length

  console.log(`✅ Cuentas de credenciales creadas: ${users.length}, corregidas: ${fixed}`)
}

run()
  .catch((error) => {
    console.error('❌ Error migrando credenciales:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
