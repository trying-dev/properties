import 'dotenv/config'
import { PrismaClient } from '+/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error('DATABASE_URL is not configured')

type Adapter = PrismaLibSql | PrismaPg

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaAdapter: Adapter | undefined
}

const isPostgres = databaseUrl.toLowerCase().startsWith('postgres')

// The prisma-client generator (Prisma 7 queryCompiler) requires a driver adapter.
const adapter: Adapter =
  globalForPrisma.prismaAdapter ??
  (isPostgres ? new PrismaPg({ connectionString: databaseUrl }) : new PrismaLibSql({ url: databaseUrl }))

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: [
      // 'query',
      'error',
      'warn',
    ],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaAdapter = adapter
}
