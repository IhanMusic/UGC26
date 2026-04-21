import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function saveBase64Image(dataUrl: string) {
  // Expect `data:image/...;base64,...`
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");
  const mime = match[1];
  const base64 = match[2];
  const ext = mime.split("/")[1] ?? "png";
  const file = `${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(uploadDir, { recursive: true });
  const buf = Buffer.from(base64, "base64");
  await fs.writeFile(path.join(uploadDir, file), buf);
  return `/uploads/${file}`;
}
