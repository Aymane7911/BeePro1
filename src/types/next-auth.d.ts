// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      companyId?: string
      role?: string
    }
  }

  interface User {
    id: string
    companyId?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    companyId: string
    databaseId: string  // Add this
    role: string
  }
}