import "dotenv/config";
import { Worker } from "bullmq";
import { env } from "@/server/env";
import { sendEmail } from "@/server/email";
import type { SendEmailJob } from "@/server/queues/email-queue";

if (!env.REDIS_URL) {
  console.warn("[email-worker] REDIS_URL not configured. Worker will not start.");
  process.exit(0);
}

const worker = new Worker<SendEmailJob>(
  "emails",
  async (job) => {
    const payload = job.data;
    await sendEmail(payload);
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
  }
);

worker.on("failed", (job, err) => {
  console.error("[email-worker] job failed", job?.id, err);
});

console.log("[email-worker] started");
