import "dotenv/config";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.isDeleted || user.isBlocked) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as JWT;
      if (user) {
        t.sub = user.id;
        t.role = user.role;
        t.isVerified = user.isVerified ?? false;
      } else if (t.sub) {
        // Re-check isVerified on every token refresh so banner clears immediately after verification
        const dbUser = await prisma.user.findUnique({
          where: { id: t.sub },
          select: { isVerified: true },
        });
        if (dbUser) t.isVerified = dbUser.isVerified;
      }
      return t;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token as JWT).role ?? "INFLUENCER";
        session.user.isVerified = (token as JWT).isVerified ?? false;
      }
      return session;
    },
  },
};
