"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-xl items-center px-4 py-16">
        <Card className="w-full animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-xl">Reset password</CardTitle>
            <CardDescription>Set a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)] backdrop-blur-sm">
                  Missing token.
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/forgot-password">Request a new link</Link>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setError(null);
                  const res = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password }),
                  });
                  setLoading(false);

                  if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    setError(data?.error ?? "Could not reset password");
                    return;
                  }

                  router.push("/auth/login");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    required
                  />
                </div>
                {error ? (
                  <div className="rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)] backdrop-blur-sm">
                    {error}
                  </div>
                ) : null}
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Saving…" : "Save new password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
