import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// types/auth.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null | undefined;
      image?: string | null | undefined;
      firstName: string;
      lastName: string;
      companyId: string;
      role: string;
      databaseId: string;
    };
  }
}

  


declare module 'next-auth/jwt' {
  interface JWT {
    companyId: string;
  }
}