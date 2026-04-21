import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),

  SMTP_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  SMTP_URL: process.env.SMTP_URL,
  REDIS_URL: process.env.REDIS_URL,
});
