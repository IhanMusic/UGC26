import { prisma } from "@/server/db";
import type { NotificationType } from "../generated/prisma/enums";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link ?? null,
      },
    });
  } catch (err) {
    // Non-blocking: log but don't throw
    console.error("[createNotification] Failed:", err);
  }
}
