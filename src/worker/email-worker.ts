import "dotenv/config";
import { Worker } from "bullmq";
import { env } from "@/server/env";
import { sendEmail } from "@/server/email";
import type { SendEmailJob } from "@/server/queues/email-queue";
import { VerifyEmailTemplate } from "@/emails/verify-email";
import { ForgotPasswordTemplate } from "@/emails/forgot-password";
import { NewApplicationTemplate } from "@/emails/new-application";
import { ApplicationPrevalidatedTemplate } from "@/emails/application-prevalidated";
import { DeliverableSubmittedTemplate } from "@/emails/deliverable-submitted";
import { CampaignConfirmedTemplate } from "@/emails/campaign-confirmed";
import { ContactFormTemplate } from "@/emails/contact-form";
import React from "react";

if (!env.REDIS_URL) {
  console.warn("[email-worker] REDIS_URL not configured. Worker will not start.");
  process.exit(0);
}

function jobToReact(job: SendEmailJob): React.ReactElement {
  switch (job.type) {
    case "verify-email":
      return React.createElement(VerifyEmailTemplate, { firstName: job.firstName, verifyUrl: job.verifyUrl });
    case "forgot-password":
      return React.createElement(ForgotPasswordTemplate, { firstName: job.firstName, resetUrl: job.resetUrl });
    case "new-application":
      return React.createElement(NewApplicationTemplate, { companyName: job.companyName, influencerName: job.influencerName, campaignTitle: job.campaignTitle, applicantsUrl: job.applicantsUrl });
    case "application-prevalidated":
      return React.createElement(ApplicationPrevalidatedTemplate, { companyName: job.companyName, influencerName: job.influencerName, campaignTitle: job.campaignTitle, applicantsUrl: job.applicantsUrl });
    case "deliverable-submitted":
      return React.createElement(DeliverableSubmittedTemplate, { companyName: job.companyName, influencerName: job.influencerName, campaignTitle: job.campaignTitle, deliverablesUrl: job.deliverablesUrl });
    case "campaign-confirmed":
      return React.createElement(CampaignConfirmedTemplate, { influencerName: job.influencerName, campaignTitle: job.campaignTitle, netAmountDinar: job.netAmountDinar, paymentsUrl: job.paymentsUrl });
    case "contact-form":
      return React.createElement(ContactFormTemplate, { senderName: job.senderName, senderEmail: job.senderEmail, subject: job.subject, message: job.message });
  }
}

const worker = new Worker<SendEmailJob>(
  "emails",
  async (job) => {
    const payload = job.data;
    await sendEmail({
      to: payload.to,
      subject: payload.subject,
      react: jobToReact(payload),
    });
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
