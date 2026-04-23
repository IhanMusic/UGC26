"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const t = useTranslations("notifications");
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchNotifications = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${p}&size=20`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setPages(data.pages);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
    }
    if (n.link) router.push(n.link as never);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("justNow");
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  if (!session?.user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("title")}</h1>
        <button
          type="button"
          onClick={markAllRead}
          className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]"
        >
          {t("markAllRead")}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary-dim)] border-t-[var(--primary)]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-16 text-center text-sm text-[var(--foreground-muted)] backdrop-blur-2xl">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              type="button"
              className={cn(
                "flex w-full gap-4 rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]",
                !n.read ? "bg-[var(--primary-dim)] border border-[var(--border)]" : "bg-[var(--surface)] border border-[var(--border)]"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", n.read ? "text-[var(--foreground-muted)]" : "text-[var(--foreground)]")}>
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">{n.message}</p>
              </div>
              <span className="text-[10px] text-[var(--foreground-muted)] flex-shrink-0 pt-1">{timeAgo(n.createdAt)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-mid)] disabled:opacity-50"
          >
            ←
          </button>
          <span className="text-xs text-[var(--foreground-muted)]">
            {page} / {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-mid)] disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
