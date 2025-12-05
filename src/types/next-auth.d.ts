import 'next-auth'
import 'next-auth/jwt'

import { AdminLevel } from '@prisma/client'

type UserRoleForAuth = 'admin' | 'tenant'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: UserRoleForAuth
      adminLevel?: AdminLevel
      emailVerified: Date | null
      phoneVerified: Date | null
    }
  }

  interface User {
    role: UserRoleForAuth
    adminLevel?: AdminLevel
    emailVerified: Date | null
    phoneVerified: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRoleForAuth
    adminLevel?: AdminLevel
    emailVerified: Date | null
    phoneVerified: Date | null
  }
}
