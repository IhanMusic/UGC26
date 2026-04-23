"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InfluencerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2>(1);

  const [step1, setStep1] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mainAccountLink: "",
    password: "",
    acceptTos: false,
  });

  const [step2, setStep2] = useState({
    ownsComputer: true,
    emailCheckFrequency: "Daily",
    internetHabits: "",
    socialNetworks: "Instagram,TikTok",
    passion: "",
    followersCountRange: "",
    postFrequency: "",
    goal: "",
    ethicsImportant: true,
    ethicsTop3Elements: "",
    trustLevel: "",
    shareOpinionsImportant: true,
    brandCommitmentsImportant: true,
  });

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-3xl items-center px-4 py-16">
        <Card className="w-full animate-fade-in-up">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-[var(--background)] shadow-lg shadow-[var(--primary-glow)]">
                {step}
              </div>
              <div>
                <CardTitle className="text-xl">Influencer registration</CardTitle>
                <CardDescription>
                  Step {step} of 2 (OTP disabled as requested).
                </CardDescription>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  if (!step1.acceptTos) {
                    setError("Please accept Terms & Conditions.");
                    return;
                  }
                  setStep(2);
                }}
              >
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input value={step1.firstName} onChange={(e) => setStep1({ ...step1, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input value={step1.lastName} onChange={(e) => setStep1({ ...step1, lastName: e.target.value })} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" value={step1.email} onChange={(e) => setStep1({ ...step1, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Mobile number</Label>
                  <Input value={step1.phone} onChange={(e) => setStep1({ ...step1, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Main account link</Label>
                  <Input value={step1.mainAccountLink} onChange={(e) => setStep1({ ...step1, mainAccountLink: e.target.value })} placeholder="Instagram / YouTube" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Password</Label>
                  <Input type="password" value={step1.password} onChange={(e) => setStep1({ ...step1, password: e.target.value })} required />
                </div>
                <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 py-3 text-sm text-[var(--foreground)] backdrop-blur-sm transition-colors hover:bg-[var(--primary-dim)]">
                  <input
                    type="checkbox"
                    checked={step1.acceptTos}
                    onChange={(e) => setStep1({ ...step1, acceptTos: e.target.checked })}
                    className="h-4 w-4 rounded-md border-[var(--border)] text-[var(--primary)]"
                  />
                  I accept the Terms & Conditions.
                </label>

                {error ? (
                  <div role="alert" className="md:col-span-2 rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)] backdrop-blur-sm">
                    {error}
                  </div>
                ) : null}

                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" className="flex-1">Continue →</Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                </div>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setError(null);
                  const res = await fetch("/api/auth/register/influencer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ step1, step2 }),
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Do you own a computer?</Label>
                    <Input value={step2.ownsComputer ? "Yes" : "No"} onChange={() => {}} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>How often do you check emails?</Label>
                    <Input value={step2.emailCheckFrequency} onChange={(e) => setStep2({ ...step2, emailCheckFrequency: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>What are your internet habits?</Label>
                    <Input value={step2.internetHabits} onChange={(e) => setStep2({ ...step2, internetHabits: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>What social networks are you on?</Label>
                    <Input value={step2.socialNetworks} onChange={(e) => setStep2({ ...step2, socialNetworks: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Passion</Label>
                    <Input value={step2.passion} onChange={(e) => setStep2({ ...step2, passion: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Followers range</Label>
                    <Input value={step2.followersCountRange} onChange={(e) => setStep2({ ...step2, followersCountRange: e.target.value })} placeholder="e.g. 10k-50k" />
                  </div>
                  <div className="space-y-2">
                    <Label>How often do you post?</Label>
                    <Input value={step2.postFrequency} onChange={(e) => setStep2({ ...step2, postFrequency: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Your goal</Label>
                    <Input value={step2.goal} onChange={(e) => setStep2({ ...step2, goal: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Top 3 ethics elements</Label>
                    <Input value={step2.ethicsTop3Elements} onChange={(e) => setStep2({ ...step2, ethicsTop3Elements: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Trust level</Label>
                    <Input value={step2.trustLevel} onChange={(e) => setStep2({ ...step2, trustLevel: e.target.value })} />
                  </div>
                </div>

                {error ? (
                  <div role="alert" className="rounded-xl border border-[var(--danger)] bg-[var(--danger-dim)] px-4 py-3 text-sm text-[var(--danger)] backdrop-blur-sm">
                    {error}
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating…" : "Create account"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
