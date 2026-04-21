import "dotenv/config";
import nodemailer from "nodemailer";
import { env } from "@/server/env";

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const smtpUrl = env.SMTP_URL;

  // Dev mode: no SMTP configured
  if (!smtpUrl) {
    console.log("\n--- EMAIL (dev mode) ---");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log(options.html);
    console.log("--- END EMAIL ---\n");
    return;
  }

  const transporter = nodemailer.createTransport(smtpUrl);

  await transporter.sendMail({
    from: "UGC26 <no-reply@ugc26.local>",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
