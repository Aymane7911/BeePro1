// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string; // Keep as string for NextAuth compatibility
      email: string;
      name?: string;
      image?: string;
      firstName: string;
      lastName: string;
      databaseId: string; // This matches your Prisma schema (UUID string)
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    databaseId: string;
    companyId: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number; // This should match your Prisma beeusers.id (Int)
    id: string; // NextAuth internal ID (keep as string)
    email?: string;
    firstName?: string;
    lastName?: string;
    databaseId?: string; // UUID string from Database model
    role?: string;
  }
}