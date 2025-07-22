// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      companyId: string
      databaseId: string  // Add this
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    companyId: string
    databaseId: string  // Add this
    role: string
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