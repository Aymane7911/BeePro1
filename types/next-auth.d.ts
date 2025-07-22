// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    // Merge the built‑in user props with your own:
    user: DefaultSession["user"] & {
      id: string;
      firstName: string;
      lastName: string;
      databaseId: string;
      companyId: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    databaseId?: string;
    companyId?: string;
    role?: string;
  }
}
