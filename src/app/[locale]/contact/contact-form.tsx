"use client";

import { useState } from "react";

interface ContactFormProps {
  labels: {
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    successTitle: string;
    successMessage: string;
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
      <div className="card-cyber p-12 flex items-center justify-center min-h-[400px] animate-fade-in">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              boxShadow: "0 0 30px var(--accent-glow)",
            }}
          >
            ✓
          </div>
          <p className="font-display font-bold text-xl text-[var(--foreground)] mb-2">
            {labels.successTitle}
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">
            {labels.successMessage}
          </p>
        </div>
      </div>
    );
  }

  const fieldClass = "input-cyber";
  const labelClass = "block font-mono-accent text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-2";

  return (
    <div className="card-cyber p-8">
      <span className="tag-neon mb-6 inline-flex">// message.send()</span>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className={labelClass}>{labels.name}</label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>{labels.email}</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>{labels.subject}</label>
          <input
            id="subject"
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>{labels.message}</label>
          <textarea
            id="message"
            rows={5}
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {status === "error" && (
          <p className="font-mono-accent text-xs text-[var(--danger)]">
            ✗ Une erreur s&apos;est produite. Réessayez.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-solid-cyan w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              Envoi...
            </span>
          ) : (
            labels.send + " →"
          )}
        </button>
      </form>
    </div>
  );
}
