import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error('DATABASE_URL is not configured')

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaAdapter: PrismaLibSql | undefined
}

const isPostgres = databaseUrl.toLowerCase().startsWith('postgres')
const isLibSql =
  databaseUrl.toLowerCase().startsWith('libsql') || databaseUrl.toLowerCase().startsWith('file:')

const adapter =
  !isPostgres && isLibSql
    ? (globalForPrisma.prismaAdapter ?? new PrismaLibSql({ url: databaseUrl }))
    : undefined

const accelerateUrl = process.env.PRISMA_DATABASE_URL

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(adapter ? { adapter } : {}),
    ...(accelerateUrl ? { accelerateUrl } : {}),
    log: [
      // 'query',
      'error',
      'warn',
    ],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  if (adapter) globalForPrisma.prismaAdapter = adapter
}
