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
      companyId: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    companyId: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    companyId: string;
    role: string;
  }
}