import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      checks: { db: "ok" },
      ms: Date.now() - started,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        checks: { db: "fail" },
        ms: Date.now() - started,
      },
      { status: 500 }
    );
  }
}
