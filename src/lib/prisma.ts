import { PrismaClient } from '@prisma/client'

// confía en mí, voy a usar un objeto global que tiene opcionalmente un PrismaClient
// globalThis tiene su propio tipo estándar.
// as unknown borra temporalmente el tipo real de globalThis.
// as { prisma: PrismaClient | undefined } fuerza un nuevo tipo que incluye prisma.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
