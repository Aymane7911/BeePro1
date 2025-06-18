// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      isProfileComplete?: boolean;
      dbUser?: any; // You can type this more specifically based on your Prisma model
    } & DefaultSession["user"];
    accessToken?: string; // Add this line
  }

  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    isProfileComplete?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    accessToken?: string; // Add this line
  }
}