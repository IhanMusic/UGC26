import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_SIZE_IMAGE = 5 * 1024 * 1024;
const MAX_SIZE_PDF = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const isPdf = file.type === "application/pdf";
  const maxSize = isPdf ? MAX_SIZE_PDF : MAX_SIZE_IMAGE;

  if (file.size > maxSize)
    return NextResponse.json(
      { error: `File too large (max ${isPdf ? "20MB" : "5MB"})` },
      { status: 400 }
    );
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const ext = isPdf ? "pdf" : file.type.split("/")[1]!.replace("jpeg", "jpg");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", String(year), month);

  await mkdir(dir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, filename), Buffer.from(bytes));

  const url = `/uploads/${year}/${month}/${filename}`;
  return NextResponse.json({ url });
}
