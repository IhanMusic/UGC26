import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";

// GET: list conversations for current user
export async function GET() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: user.id } },
    },
    include: {
      campaign: { select: { id: true, title: true } },
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true, imageUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, content: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Compute unread count per conversation
  const result = conversations.map((conv) => {
    const myParticipant = conv.participants.find((p) => p.userId === user.id);
    const lastReadAt = myParticipant?.lastReadAt ?? new Date(0);
    const lastMessage = conv.messages[0] ?? null;
    const otherParticipants = conv.participants.filter((p) => p.userId !== user.id);

    return {
      id: conv.id,
      campaign: conv.campaign,
      otherParticipants: otherParticipants.map((p) => p.user),
      lastMessage,
      lastReadAt,
      updatedAt: conv.updatedAt,
    };
  });

  return NextResponse.json({ conversations: result });
}

// POST: create or get existing conversation
export async function POST(req: Request) {
  const user = await requireUser();
  const body = (await req.json().catch(() => null)) as
    | { recipientId?: string; campaignId?: string }
    | null;

  const recipientId = body?.recipientId;
  const campaignId = body?.campaignId || null;

  if (!recipientId) {
    return NextResponse.json({ error: "Missing recipientId" }, { status: 400 });
  }

  if (recipientId === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Check if conversation already exists between these two users (optionally for same campaign)
  const existing = await prisma.conversation.findFirst({
    where: {
      ...(campaignId ? { campaignId } : {}),
      AND: [
        { participants: { some: { userId: user.id } } },
        { participants: { some: { userId: recipientId } } },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ conversationId: existing.id });
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      campaignId,
      participants: {
        create: [
          { userId: user.id },
          { userId: recipientId },
        ],
      },
    },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
