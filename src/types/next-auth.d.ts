// In your NextAuth configuration (likely in lib/auth.ts or similar)
async session({ session, token }) {
  if (token.userId) {
    session.user = {
      id: token.userId.toString(), // Convert number to string for NextAuth compatibility
      email: token.email as string,
      name: session.user?.name, // Preserve existing name if needed
      image: session.user?.image, // Preserve existing image if needed
      firstName: token.firstName as string,
      lastName: token.lastName as string,
      databaseId: token.databaseId as string, // This is already a string (UUID)
      role: token.role as string,
    };
  }
  return session;
}

// Updated types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string; // Keep as string for NextAuth compatibility
      email: string;
      name?: string | null;
      image?: string | null;
      firstName: string;
      lastName: string;
      databaseId: string; // This matches your Prisma schema (UUID string)
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    databaseId: string;
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