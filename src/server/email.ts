import "dotenv/config";
import { Resend } from "resend";
import { env } from "@/server/env";
import type { ReactElement } from "react";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const resend = getResend();

  if (!resend) {
    console.log("\n--- EMAIL (dev mode, no RESEND_API_KEY) ---");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("--- END EMAIL ---\n");
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM ?? "UGC26 <noreply@ugc26.dz>",
    to: options.to,
    subject: options.subject,
    react: options.react,
  });

  if (error) {
    console.error("Resend error:", error);
  }
}
