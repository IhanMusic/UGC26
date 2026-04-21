import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const redisUrl = process.env.REDIS_URL;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial unread count immediately
      try {
        const count = await prisma.notification.count({
          where: { userId, read: false },
        });
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ count })}\n\n`)
        );
      } catch {
        // DB error — send 0 as safe default
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ count: 0 })}\n\n`)
        );
      }

      if (!redisUrl) {
        // No Redis — initial count already sent, no live updates
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis");
      const subscriber = new Redis(redisUrl);
      const channel = `notifications:${userId}`;

      subscriber.subscribe(channel);
      subscriber.on("message", async () => {
        try {
          const newCount = await prisma.notification.count({
            where: { userId, read: false },
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ count: newCount })}\n\n`)
          );
        } catch {
          // silent
        }
      });

      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepalive);
        }
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(keepalive);
        subscriber.unsubscribe(channel);
        subscriber.quit();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
