import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: "ADMIN" | "COMPANY" | "INFLUENCER";
      isVerified: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: "ADMIN" | "COMPANY" | "INFLUENCER";
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "COMPANY" | "INFLUENCER";
    isVerified?: boolean;
  }
}
