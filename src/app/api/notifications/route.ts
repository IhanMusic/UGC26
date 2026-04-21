import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";
import { getPagination, pageCount } from "@/server/pagination";

export async function GET(req: Request) {
  const user = await requireUser();
  const url = new URL(req.url);
  const sp = Object.fromEntries(url.searchParams);
  const { page, size, skip } = getPagination(sp);

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: size,
    }),
    prisma.notification.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    notifications,
    page,
    pages: pageCount(total, size),
    total,
  });
}
