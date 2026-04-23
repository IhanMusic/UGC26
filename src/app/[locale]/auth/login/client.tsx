"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-5xl items-center px-4 py-16">
        <div className="grid w-full gap-10 md:grid-cols-2">
          {/* Left side - Info */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-high)] px-4 py-1.5 text-xs font-medium text-[var(--primary)] shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse-dot" />
              UGC26 • Influencers Marketplace
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              <span className="gradient-text">Login to continue</span>
            </h1>
            <p className="max-w-prose text-[var(--foreground-muted)]">
              Use the seeded accounts for demo:
              <br />
              <span className="font-medium text-[var(--foreground)]">admin@ugc26.local</span>,
              <span className="font-medium text-[var(--foreground)]"> influencer@ugc26.local</span>,
              <span className="font-medium text-[var(--foreground)]"> company@ugc26.local</span>
              <br />Password: <span className="font-medium text-[var(--foreground)]">Password123!</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("admin@ugc26.local");
                  setPassword("Password123!");
                }}
              >
                Fill admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("influencer@ugc26.local");
                  setPassword("Password123!");
                }}
              >
                Fill influencer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail("company@ugc26.local");
                  setPassword("Password123!");
                }}
              >
                Fill company
              </Button>
            </div>
          </div>

          {/* Right side - Form */}
          <Card className="animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription>
                No OTP/Stripe for now (as requested). Credentials auth only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setError(null);
                  const res = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                  });
                  setLoading(false);

                  if (!res || res.error) {
                    setError("Invalid credentials or blocked account.");
                    return;
                  }

                  if (callbackUrl !== "/") {
                    router.push(callbackUrl);
                    return;
                  }

                  const me = await fetch("/api/me").then((r) => r.json()).catch(() => null);
                  const role = me?.user?.role as string | undefined;
                  if (role === "ADMIN") router.push("/admin");
                  else if (role === "COMPANY") router.push("/company");
                  else if (role === "INFLUENCER") router.push("/influencer");
                  else router.push("/");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-[var(--primary)] underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                {error ? (
                  <div role="alert" className="rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)] backdrop-blur-sm">
                    {error}
                  </div>
                ) : null}
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
