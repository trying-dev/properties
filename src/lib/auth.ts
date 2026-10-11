import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { headers } from 'next/headers'
import { cache } from 'react'

import { hashPassword, verifyPassword } from '+/lib/credentials'
import { prisma } from '+/lib/prisma'

const SESSION_DAYS = 30

export type AppRole = 'admin' | 'owner' | 'tenant'

export type AppSession = {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role: AppRole
    adminLevel?: string
  }
  expires: string
}

const isPostgres = process.env.DATABASE_URL?.toLowerCase().startsWith('postgres') ?? false

export const authServer = betterAuth({
  database: prismaAdapter(prisma, { provider: isPostgres ? 'postgresql' : 'sqlite' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: false,
    password: { hash: hashPassword, verify: verifyPassword },
  },

  user: {
    fields: { emailVerified: 'isEmailVerified', image: 'profileImage' },
  },

  session: {
    expiresIn: SESSION_DAYS * 24 * 60 * 60,
    // Evita consultar la base en cada request; se revalida cada minuto.
    cookieCache: { enabled: true, maxAge: 60 },
  },

  plugins: [nextCookies()],
})

// Sesión de la app: usuario de Better Auth + rol y nivel de admin calculados desde la base.
export const auth = cache(async (): Promise<AppSession | null> => {
  const data = await authServer.api.getSession({ headers: await headers() })
  if (!data?.user?.id) return null

  const account = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: {
      name: true,
      email: true,
      disable: true,
      admin: { select: { adminLevel: true } },
      owner: { select: { id: true } },
    },
  })

  // Usuario borrado o deshabilitado: la sesión deja de ser válida.
  if (!account || account.disable) return null

  return {
    user: {
      id: data.user.id,
      name: account.name,
      email: account.email,
      role: account.admin ? 'admin' : account.owner ? 'owner' : 'tenant',
      adminLevel: account.admin?.adminLevel ?? undefined,
    },
    expires: data.session.expiresAt.toISOString(),
  }
})

export type SignInResult = { success: true; userId: string } | { success: false; code: 'INVALID_CREDENTIALS' | 'ACCOUNT_DISABLED' | 'UNKNOWN' }

export const signInWithCredentials = async (email: string, password: string): Promise<SignInResult> => {
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { disable: true } })
    if (user?.disable) return { success: false, code: 'ACCOUNT_DISABLED' }

    const result = await authServer.api.signInEmail({
      body: { email: normalizedEmail, password },
      headers: await headers(),
    })
    return { success: true, userId: result.user.id }
  } catch (error) {
    if (error instanceof APIError && error.status === 'UNAUTHORIZED') {
      return { success: false, code: 'INVALID_CREDENTIALS' }
    }
    console.error('Error durante el inicio de sesión:', error)
    return { success: false, code: 'UNKNOWN' }
  }
}

export const signOut = async () => {
  await authServer.api.signOut({ headers: await headers() })
}
