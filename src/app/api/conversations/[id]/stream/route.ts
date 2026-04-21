import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id: conversationId } = await params;

  // Verify user is a participant (via ConversationParticipant join table)
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  });
  if (!participant) return new Response("Forbidden", { status: 403 });

  const redisUrl = process.env.REDIS_URL;

  const stream = new ReadableStream({
    start(controller) {
      if (!redisUrl) {
        // No Redis — send a single keepalive and leave open for graceful close
        controller.enqueue(new TextEncoder().encode(": keepalive\n\n"));
        return;
      }

      // Use a dedicated subscriber connection (cannot reuse shared client)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis");
      const subscriber = new Redis(redisUrl);
      const channel = `conversation:${conversationId}`;

      subscriber.subscribe(channel);
      subscriber.on("message", (_chan: string, msg: string) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${msg}\n\n`));
        } catch {
          // controller already closed
        }
      });

      // Keepalive every 25s to prevent proxy timeouts
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keepalive\n\n"));
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
