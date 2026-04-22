"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { fileToDataUrl } from "@/components/file-utils";

type Category = { id: string; name: string };

export default function CompanyRequestCampaignClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    title: "",
    priceDinar: 0,
    description: "",
    objectivePlatforms: "Instagram",
    minFollowers: 0,
    ageRange: "18-35",
    country: "Algeria",
  });

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [additionalPhotoDataUrls, setAdditionalPhotoDataUrls] = useState<string[]>([]);

  const categoryIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected]
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <CardTitle>Request a campaign</CardTitle>
        <CardDescription>
          Provide details. Admin will review and publish if approved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="animate-shimmer h-11 rounded-xl bg-slate-100" />
            <div className="animate-shimmer h-11 rounded-xl bg-slate-100" />
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              const res = await fetch("/api/company/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...form,
                  categoryIds,
                  photoDataUrl,
                  additionalPhotoDataUrls,
                }),
              });
              setSaving(false);
              if (!res.ok) {
                alert("Could not submit request");
                return;
              }
              alert("Request submitted");
              window.location.href = "/company/campaigns";
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Price (DZD)</Label>
                <Input
                  type="number"
                  value={form.priceDinar}
                  onChange={(e) => setForm({ ...form, priceDinar: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Objective platforms</Label>
                <Input value={form.objectivePlatforms} onChange={(e) => setForm({ ...form, objectivePlatforms: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Min followers</Label>
                <Input
                  type="number"
                  value={form.minFollowers}
                  onChange={(e) => setForm({ ...form, minFollowers: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Age range</Label>
                <Input value={form.ageRange} onChange={(e) => setForm({ ...form, ageRange: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Categories</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-200 cursor-pointer ${
                      selected[c.id]
                        ? "border-violet-300 bg-violet-50/80 text-violet-700 shadow-sm"
                        : "border-slate-200/60 bg-white/50 text-slate-700 hover:bg-violet-50/50 hover:border-violet-200"
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Main photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setPhotoDataUrl(await fileToDataUrl(f));
                  }}
                />
                {photoDataUrl ? (
                  photoDataUrl.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoDataUrl} alt="preview" className="mt-2 h-32 w-full rounded-xl object-cover" />
                  ) : (
                    <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl">
                      <Image src={photoDataUrl} alt="preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                    </div>
                  )
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Additional photos (up to 5)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []).slice(0, 5);
                    const data = await Promise.all(files.map((f) => fileToDataUrl(f)));
                    setAdditionalPhotoDataUrls(data);
                  }}
                />
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {additionalPhotoDataUrls.map((d, idx) => (
                    d.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={idx} src={d} alt="preview" className="h-14 w-full rounded-lg object-cover" />
                    ) : (
                      <div key={idx} className="relative h-14 w-full overflow-hidden rounded-lg">
                        <Image src={d} alt="preview" fill className="object-cover" sizes="20vw" />
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            <Button disabled={saving} type="submit">
              {saving ? "Submitting…" : "Submit request"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
