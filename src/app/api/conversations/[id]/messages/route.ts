import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";
import { createNotification } from "@/server/notifications";

// GET: list messages in a conversation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id: conversationId } = await params;

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const take = 50;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true, imageUrl: true },
      },
    },
  });

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: messages.length === take ? messages[0]?.id : null,
  });
}

// POST: send a message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id: conversationId } = await params;

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content,
    },
    include: {
      sender: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true, imageUrl: true },
      },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Update sender's lastReadAt
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  // Publish to Redis for SSE subscribers
  if (process.env.REDIS_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis");
      const publisher = new Redis(process.env.REDIS_URL);
      await publisher.publish(
        `conversation:${conversationId}`,
        JSON.stringify(message)
      );
      await publisher.quit();
    } catch {
      // non-fatal: SSE publish failure should not break message delivery
    }
  }

  // Notify other participants
  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: user.id } },
  });

  // Fetch sender full name from DB
  const senderUser = await prisma.user.findUnique({ where: { id: user.id }, select: { firstName: true, lastName: true } });
  const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : (user.email ?? "User");
  for (const p of otherParticipants) {
    await createNotification({
      userId: p.userId,
      type: "NEW_MESSAGE",
      title: "Nouveau message",
      message: `${senderName}: ${content.length > 80 ? content.slice(0, 80) + "…" : content}`,
      link: "/messages",
    });
    // Publish to notification SSE channel for recipient
    if (process.env.REDIS_URL) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Redis = require("ioredis");
        const notifPublisher = new Redis(process.env.REDIS_URL);
        await notifPublisher.publish(`notifications:${p.userId}`, "new");
        await notifPublisher.quit();
      } catch {
        // non-fatal
      }
    }
  }

  return NextResponse.json({ message }, { status: 201 });
}
