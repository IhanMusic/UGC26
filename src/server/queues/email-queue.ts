import { Queue } from "bullmq";
import { env } from "@/server/env";

export type SendEmailJob =
  | { type: "verify-email"; to: string; subject: string; firstName: string; verifyUrl: string }
  | { type: "forgot-password"; to: string; subject: string; firstName: string; resetUrl: string }
  | { type: "new-application"; to: string; subject: string; companyName: string; influencerName: string; campaignTitle: string; applicantsUrl: string }
  | { type: "application-prevalidated"; to: string; subject: string; companyName: string; influencerName: string; campaignTitle: string; applicantsUrl: string }
  | { type: "deliverable-submitted"; to: string; subject: string; companyName: string; influencerName: string; campaignTitle: string; deliverablesUrl: string }
  | { type: "campaign-confirmed"; to: string; subject: string; influencerName: string; campaignTitle: string; netAmountDinar: number; paymentsUrl: string }
  | { type: "contact-form"; to: string; subject: string; senderName: string; senderEmail: string; message: string };

export const emailQueue = env.REDIS_URL
  ? new Queue<SendEmailJob>("emails", {
      connection: {
        url: env.REDIS_URL,
      },
    })
  : null;

export async function enqueueEmail(job: SendEmailJob) {
  if (!emailQueue) {
    // Fallback: no Redis => caller should do sync send or dev log
    return null;
  }
  return emailQueue.add(
    "send",
    job,
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    }
  );
}
