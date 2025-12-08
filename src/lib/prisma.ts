import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  adapter: PrismaLibSql | undefined
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const isProd = process.env.NODE_ENV === 'production'
const isPostgres = databaseUrl.startsWith('postgres')

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (isProd && isPostgres) {
      return new PrismaClient({
        log: ['error', 'warn'],
      })
    }

    const adapter =
      globalForPrisma.adapter ??
      new PrismaLibSql({
        url: databaseUrl,
      })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.adapter = adapter
    }

    return new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn'],
    })
  })()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
