import { compare } from 'bcryptjs'
import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { AdminLevel } from '@prisma/client'

import { userManager } from '+/actions/user/manager'
import { UserRoleForAuth } from '+/types/next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/', // Tu página de login personalizada (home)
  },

  providers: [
    Credentials({
      name: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await userManager.findByEmail(credentials.email as string)

          if (!user || !user.password) return null

          const isPasswordValid = await compare(credentials.password as string, user.password)

          if (!isPasswordValid) return null

          if (user.disable) return null

          await userManager.updateLastLogin(user.id)

          let role: UserRoleForAuth
          let adminLevel: AdminLevel | undefined

          if (user.admin) {
            role = 'admin'
            adminLevel = user.admin.adminLevel
          } else if (user.tenant) {
            role = 'tenant'
          } else {
            return null
          }

          return {
            id: user.id,
            name: `${user.name} ${user.lastName}`,
            email: user.email,
            image: user.profileImage,
            role,
            adminLevel,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
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

      // Solo rutas públicas vs protegidas
      if (!pathname.startsWith('/dashboard')) {
        if (auth?.user && pathname === '/') {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
        return true
      }

      return !!auth?.user // Dashboard requiere login
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.adminLevel = user.adminLevel
        token.emailVerified = user.emailVerified
        token.phoneVerified = user.phoneVerified
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.adminLevel = token.adminLevel
        session.user.emailVerified = token.emailVerified
        session.user.phoneVerified = token.phoneVerified
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig)
