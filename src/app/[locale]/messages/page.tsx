"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/utils";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  imageUrl: string | null;
}

interface ConversationItem {
  id: string;
  campaign: { id: string; title: string } | null;
  otherParticipants: User[];
  lastMessage: { id: string; content: string; createdAt: string; senderId: string } | null;
  lastReadAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: User;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const t = useTranslations("messaging");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const userId = session?.user?.id;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      // silent
    }
  }, []);

  // Select conversation
  const selectConversation = (convId: string) => {
    setActiveConvId(convId);
    fetchMessages(convId);
  };

  // SSE stream for active conversation — replaces polling
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    if (!activeConvId) return;

    const es = new EventSource(`/api/conversations/${activeConvId}/stream`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch {
        // ignore
      }
    };
    es.onerror = () => es.close();

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMsg.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMsg("");
        fetchConversations(); // refresh sidebar
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return t("yesterday");
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-2xl">
      {/* Sidebar: Conversation list */}
      <div className={cn(
        "flex w-full flex-col border-r border-[var(--border)] md:w-80",
        activeConvId && "hidden md:flex"
      )}>
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{t("title")}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary-dim)] border-t-[var(--primary)]" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--foreground-muted)]">
              {t("noConversations")}
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.otherParticipants[0];
              const isActive = conv.id === activeConvId;
              const hasUnread = conv.lastMessage && new Date(conv.lastMessage.createdAt) > new Date(conv.lastReadAt) && conv.lastMessage.senderId !== userId;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]",
                    isActive && "bg-[var(--primary-dim)]",
                    hasUnread && "bg-[var(--surface-mid)]"
                  )}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-sm font-bold text-[var(--background)]">
                    {other?.firstName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium truncate", hasUnread ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]")}>
                        {other ? `${other.firstName} ${other.lastName}` : "Unknown"}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-[var(--foreground-muted)] flex-shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conv.campaign && (
                      <div className="text-[10px] text-[var(--primary)] truncate">{conv.campaign.title}</div>
                    )}
                    {conv.lastMessage && (
                      <p className={cn("mt-0.5 text-xs truncate", hasUnread ? "font-medium text-[var(--foreground)]" : "text-[var(--foreground-muted)]")}>
                        {conv.lastMessage.senderId === userId ? `${t("you")}: ` : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                    {hasUnread && (
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[var(--primary)]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={cn(
        "flex flex-1 flex-col",
        !activeConvId && "hidden md:flex"
      )}>
        {!activeConvId ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--foreground-muted)]">
            {t("selectConversation")}
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <button
                type="button"
                onClick={() => setActiveConvId(null)}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-mid)]"
              >
                <svg className="h-5 w-5 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-sm font-bold text-[var(--background)]">
                {activeConv?.otherParticipants[0]?.firstName?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  {activeConv?.otherParticipants[0]
                    ? `${activeConv.otherParticipants[0].firstName} ${activeConv.otherParticipants[0].lastName}`
                    : "Unknown"}
                </div>
                {activeConv?.campaign && (
                  <div className="text-[10px] text-[var(--primary)]">{activeConv.campaign.title}</div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === userId;
                return (
                  <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      isMine
                        ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--background)]"
                        : "bg-[var(--surface-mid)] text-[var(--foreground)]"
                    )}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={cn(
                        "mt-1 text-[10px]",
                        isMine ? "text-[var(--foreground-muted)]" : "text-[var(--foreground-muted)]"
                      )}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-[var(--border)] px-4 py-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={t("typePlaceholder")}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 py-2.5 text-sm outline-none transition-colors focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary-glow)]"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--background)] shadow-md shadow-[var(--primary-glow)] transition-all hover:shadow-lg disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
