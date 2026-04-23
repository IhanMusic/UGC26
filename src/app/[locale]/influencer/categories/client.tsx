"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Category = { id: string; name: string };

export default function InfluencerCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/influencer/profile-get").then((r) => r.json()),
    ])
      .then(([cats, profile]) => {
        setCategories(cats.categories ?? []);
        const ids: string[] = profile.selectedCategoryIds ?? [];
        const map: Record<string, boolean> = {};
        ids.forEach((id) => (map[id] = true));
        setSelected(map);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] shadow-lg shadow-[var(--primary-glow)]">
          <svg className="h-5 w-5 text-[var(--background)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        </div>
        <CardTitle>My categories</CardTitle>
        <CardDescription>
          Select the categories that match your content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-shimmer h-11 rounded-xl bg-[var(--surface-mid)]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((c) => (
              <label
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 cursor-pointer ${
                  selected[c.id]
                    ? "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface-high)]/50 text-[var(--foreground-muted)] hover:bg-[var(--primary-dim)]/50 hover:border-[var(--primary)]"
                }`}
              >
                <Checkbox
                  checked={Boolean(selected[c.id])}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      [c.id]: (e.target as HTMLInputElement).checked,
                    })
                  }
                />
                {c.name}
              </label>
            ))}
          </div>
        )}

        <Button
          disabled={saving || loading}
          onClick={async () => {
            setSaving(true);
            const categoryIds = Object.entries(selected)
              .filter(([, v]) => v)
              .map(([id]) => id);
            await fetch("/api/influencer/categories", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ categoryIds }),
            });
            setSaving(false);
            alert("Saved");
          }}
        >
          {saving ? "Saving…" : "Save categories"}
        </Button>
      </CardContent>
    </Card>
  );
}
