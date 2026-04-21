import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { authOptions } from "@/server/auth";

export type AppRole = "ADMIN" | "COMPANY" | "INFLUENCER";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const locale = await getLocale();
    redirect(`/${locale}/auth/login`);
  }
  return session.user;
}

export async function requireRole(role: AppRole) {
  const user = await requireUser();
  if (user.role !== role) {
    const locale = await getLocale();
    redirect(`/${locale}`);
  }
  return user;
}
