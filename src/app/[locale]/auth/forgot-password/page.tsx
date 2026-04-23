"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-xl items-center px-4 py-16">
        <Card className="w-full animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-xl">Forgot password</CardTitle>
            <CardDescription>
              We&apos;ll send you a reset link. In dev mode (no SMTP), the link is printed in the server console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--success)] bg-[var(--surface-mid)] px-4 py-3 text-sm text-[var(--success)] backdrop-blur-sm">
                  If an account exists, a reset link has been sent.
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  setLoading(false);
                  setDone(true);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                  />
                </div>
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
                <div className="text-center text-sm text-[var(--foreground-muted)]">
                  <Link href="/auth/login" className="text-[var(--primary)] underline underline-offset-4">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
