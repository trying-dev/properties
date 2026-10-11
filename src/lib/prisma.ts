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

// La conexión directa de Prisma Postgres admite pocas conexiones simultáneas. Cada instancia
// serverless (y cada recarga en dev) abre su propio pool, así que se mantiene pequeño y con
// cierre rápido de conexiones ociosas para no agotar el límite del rol.
const POOL_MAX = Number(process.env.DATABASE_POOL_MAX ?? 2)

// The prisma-client generator (Prisma 7 queryCompiler) requires a driver adapter.
const adapter: Adapter =
  globalForPrisma.prismaAdapter ??
  (isPostgres ? new PrismaPg({ connectionString: databaseUrl, max: POOL_MAX, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 15_000 }) : new PrismaLibSql({ url: databaseUrl }))

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
