"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    companyName: "",
    phone: "",
    password: "",
    acceptTos: false,
  });

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-2xl items-center px-4 py-16">
        <Card className="w-full animate-fade-in-up">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl">Company registration</CardTitle>
                <CardDescription>OTP disabled as requested.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                if (!form.acceptTos) {
                  setError("Please accept Terms & Conditions.");
                  return;
                }
                setLoading(true);
                const res = await fetch("/api/auth/register/company", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                });
                setLoading(false);
                if (!res.ok) {
                  const data = await res.json().catch(() => null);
                  setError(data?.error ?? "Could not create account");
                  return;
                }
                router.push("/auth/login");
              }}
            >
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mobile number</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>

              <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm text-slate-700 backdrop-blur-sm transition-colors hover:bg-violet-50/50">
                <input type="checkbox" checked={form.acceptTos} onChange={(e) => setForm({ ...form, acceptTos: e.target.checked })} className="h-4 w-4 rounded-md border-slate-300 text-violet-600" />
                I accept the Terms & Conditions.
              </label>

              {error ? (
                <div className="md:col-span-2 rounded-xl border border-red-200/50 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm">
                  {error}
                </div>
              ) : null}

              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
