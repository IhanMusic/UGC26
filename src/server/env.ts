import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),

  REDIS_URL: z.string().optional(),
  SATIM_DEV_SECRET: z.string().optional(),

  SATIM_TERMINAL_ID: z.string().optional(),
  SATIM_MERCHANT_ID: z.string().optional(),
  SATIM_PASSWORD: z.string().optional(),
  SATIM_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  TEAM_EMAIL: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  REDIS_URL: process.env.REDIS_URL,
  SATIM_DEV_SECRET: process.env.SATIM_DEV_SECRET,
  SATIM_TERMINAL_ID: process.env.SATIM_TERMINAL_ID,
  SATIM_MERCHANT_ID: process.env.SATIM_MERCHANT_ID,
  SATIM_PASSWORD: process.env.SATIM_PASSWORD,
  SATIM_BASE_URL: process.env.SATIM_BASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  TEAM_EMAIL: process.env.TEAM_EMAIL,
});
