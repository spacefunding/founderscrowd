import { UserRole, UserStatus } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    status: UserStatus
    firstName?: string | null
    lastName?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      role: UserRole
      status: UserStatus
      firstName?: string | null
      lastName?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    status: UserStatus
    firstName?: string | null
    lastName?: string | null
  }
}
