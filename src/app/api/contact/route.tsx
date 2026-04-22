import { NextResponse } from "next/server";
import { sendEmail } from "@/server/email";
import { enqueueEmail } from "@/server/queues/email-queue";
import { ContactFormTemplate } from "@/emails/contact-form";
import { env } from "@/server/env";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;
  const teamEmail = env.TEAM_EMAIL;

  if (!teamEmail) {
    console.warn("TEAM_EMAIL not configured — contact form email not sent");
    return NextResponse.json({ ok: true });
  }

  const queued = await enqueueEmail({
    type: "contact-form",
    to: teamEmail,
    subject: `[Contact UGC26] ${subject}`,
    senderName: name,
    senderEmail: email,
    message,
  });

  if (!queued) {
    await sendEmail({
      to: teamEmail,
      subject: `[Contact UGC26] ${subject}`,
      react: (
        <ContactFormTemplate
          senderName={name}
          senderEmail={email}
          subject={subject}
          message={message}
        />
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
