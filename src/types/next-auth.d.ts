import 'next-auth'
import 'next-auth/jwt'

type UserRoleForAuth = 'admin' | 'tenant'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      // image?: string
      role: UserRoleForAuth
      adminLevel?: string
      // emailVerified: Date | null
      // phoneVerified: Date | null
    }
  }

  interface User {
    role?: UserRoleForAuth
    adminLevel?: string
    // emailVerified: Date | null
    // phoneVerified: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRoleForAuth
    adminLevel?: string
    // emailVerified: Date | null
    // phoneVerified: Date | null
  }
}
