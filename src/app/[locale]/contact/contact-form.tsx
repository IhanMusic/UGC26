"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ContactFormProps {
  labels: {
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
  };
}

export function ContactForm({ labels }: ContactFormProps) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <Card className="animate-fade-in-up">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Message envoyé ✅</p>
            <p className="mt-2 text-slate-500">Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up">
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              {labels.name}
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm backdrop-blur-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              {labels.email}
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm backdrop-blur-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
              {labels.subject}
            </label>
            <input
              id="subject"
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm backdrop-blur-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              {labels.message}
            </label>
            <textarea
              id="message"
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm backdrop-blur-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/20 resize-none"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-red-500">Une erreur s&apos;est produite. Réessayez.</p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {status === "sending" ? "Envoi..." : labels.send}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
