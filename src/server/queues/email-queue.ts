import { Queue } from "bullmq";
import { env } from "@/server/env";

export const emailQueue = env.REDIS_URL
  ? new Queue("emails", {
      connection: {
        url: env.REDIS_URL,
      },
    })
  : null;

export type SendEmailJob = {
  to: string;
  subject: string;
  html: string;
};

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
