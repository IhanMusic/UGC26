"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { firstName?: string; lastName?: string; name?: string };
}

interface Props {
  conversationId: string | null;
}

export function CampaignChat({ conversationId }: Props) {
  const t = useTranslations("messaging");
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Load initial messages
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((data: { messages?: Message[] } | Message[]) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages(data.messages ?? []);
        }
      })
      .catch(() => {
        // silent
      });

    // SSE stream for live messages
    const es = new EventSource(`/api/conversations/${conversationId}/stream`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as Message;
        setMessages((prev) => {
          // Avoid duplicate if the sender already appended optimistically
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch {
        // ignore malformed events
      }
    };
    return () => es.close();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      if (res.ok) {
        const data = (await res.json()) as { message: Message };
        // Optimistically add our own message (SSE won't echo back to sender)
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        setInput("");
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="glass rounded-xl p-8 text-center text-[var(--foreground-muted)]">
        {t("noConversation")}
      </div>
    );
  }

  return (
    <div className="glass flex h-[500px] flex-col rounded-xl overflow-hidden">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--foreground-muted)]">
            {t("noMessages")}
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === session?.user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  isMe
                    ? "bg-[var(--primary-dim)] border border-[var(--border)] text-[var(--foreground)]"
                    : "bg-[var(--surface-mid)] text-[var(--foreground)]"
                }`}
              >
                {msg.content}
                <div
                  className={`mt-1 text-[10px] ${
                    isMe ? "text-[var(--foreground-muted)]" : "text-[var(--foreground-muted)]"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={t("typePlaceholder")}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
        />
        <button
          onClick={() => void handleSend()}
          disabled={sending || !input.trim()}
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--surface-mid)] disabled:opacity-50 transition-colors"
        >
          {t("sendButton")}
        </button>
      </div>
    </div>
  );
}
