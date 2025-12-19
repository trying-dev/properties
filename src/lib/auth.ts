import { compare } from 'bcryptjs'
import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from '+/lib/prisma'

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/' },

  logger: {
    error(error) {
      const err = error as unknown as { code?: string; name?: string; message?: string; cause?: unknown }
      const code = err?.code || err?.name || 'error'
      const cause =
        (err?.cause as { message?: string })?.message ||
        (err?.cause as string) ||
        err?.message ||
        String(error)
      console.error(`[auth][${code}]`, cause)
    },
  },

  providers: [
    Credentials({
      name: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              disable: true,
              admin: { select: { adminLevel: true } },
            },
          })

          if (!user || !user.password) return null

          const isPasswordValid = await compare(credentials.password as string, user.password)

          if (!isPasswordValid) return null

          if (user.disable) return null

          await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.admin ? 'admin' : 'tenant',
            adminLevel: user.admin?.adminLevel ?? undefined,
          }
        } catch (error) {
          console.error('Error durante la autenticación:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl

      // Solo proteger dashboard, dejar el resto (incluido "/") accesible aunque haya sesión
      if (!pathname.startsWith('/dashboard')) return true

      return !!auth?.user // Dashboard requiere login
    },

    async jwt({ token, user }) {
      if (user) {
        const userRole = (user as { role?: 'admin' | 'tenant' }).role
        const adminLevel = (user as { adminLevel?: string }).adminLevel
        const email = (user as { email?: string }).email
        const name = (user as { name?: string }).name

        if (userRole) token.role = userRole
        if (adminLevel) token.adminLevel = adminLevel
        if (email) token.email = email
        if (name) token.name = name
        return token
      }

      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            admin: { select: { adminLevel: true } },
          },
        })

        if (dbUser) {
          token.role = dbUser.admin ? 'admin' : 'tenant'
          token.adminLevel = dbUser.admin?.adminLevel ?? undefined
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role ?? 'tenant'
        session.user.adminLevel = token.adminLevel
        if (token.email) session.user.email = token.email
        if (token.name) session.user.name = token.name
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export const {
  // handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig)
