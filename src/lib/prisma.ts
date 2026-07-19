import 'dotenv/config'
import { PrismaClient } from '+/generated/prisma/client'
import type { PrismaLibSql } from '@prisma/adapter-libsql'
import type { PrismaPg } from '@prisma/adapter-pg'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error('DATABASE_URL is not configured')

type Adapter = PrismaLibSql | PrismaPg

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaAdapter: Adapter | undefined
}

const isPostgres = databaseUrl.toLowerCase().startsWith('postgres')

function resolveAdapter(): Adapter {
  if (isPostgres) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    return new PrismaPg({ connectionString: databaseUrl })
  }
  const { PrismaLibSql } = require('@prisma/adapter-libsql')
  return new PrismaLibSql({ url: databaseUrl })
}

const adapter: Adapter = globalForPrisma.prismaAdapter ?? resolveAdapter()

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
