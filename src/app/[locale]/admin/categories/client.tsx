"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ActionButton } from "@/components/action-button";

type Category = { id: string; name: string };

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, filter]);

  useEffect(() => {
    fetch("/api/admin/categories-list")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Add/edit categories used in campaigns.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
          />
          <Button
            onClick={async () => {
              const name = newName.trim();
              if (!name) return;
              await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
              });
              window.location.reload();
            }}
          >
            Add
          </Button>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter"
          />
        </CardContent>
      </Card>

      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {loading ? (
            <TR>
              <TD colSpan={2} className="text-center text-slate-400">
                <div className="animate-shimmer h-6 rounded bg-slate-100" />
              </TD>
            </TR>
          ) : filtered.length === 0 ? (
            <TR>
              <TD colSpan={2} className="text-center text-slate-400">
                No categories
              </TD>
            </TR>
          ) : (
            filtered.map((c) => (
              <TR key={c.id}>
                <TD>
                  <input
                    defaultValue={c.name}
                    className="h-9 w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 text-sm shadow-sm backdrop-blur-sm transition-all focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
                    onBlur={async (e) => {
                      const name = e.target.value.trim();
                      if (!name || name === c.name) return;
                      await fetch(`/api/admin/categories/${c.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name }),
                      });
                      window.location.reload();
                    }}
                  />
                </TD>
                <TD className="text-right">
                  <ActionButton
                    size="sm"
                    variant="destructive"
                    url={`/api/admin/categories/${c.id}`}
                    method="DELETE"
                    confirm="Delete this category?"
                  >
                    Delete
                  </ActionButton>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </div>
  );
}
