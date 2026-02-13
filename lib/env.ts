/**
 * Environment Variables
 *
 * Centralized access to environment variables with validation
 */

import { z } from "zod";

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Naiera"),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z
    .string()
    .optional()
    .default("noreply@yourdomain.com")
    .refine(
      (val) => {
        if (!val) return true;
        // Check if it's in "Name <email>" format or plain email
        const nameEmailRegex = /^(.+?)\s*<(.+?)>$/;
        const emailRegex = /^[^\s@<>]+@[^@\s<>]+\.[^@\s<>]+$/;
        return nameEmailRegex.test(val) || emailRegex.test(val);
      },
      {
        message: "EMAIL_FROM must be a valid email or 'Name <email>' format",
      }
    ),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

// Validate and parse environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;

// Type-safe access to environment variables
export type Env = z.infer<typeof envSchema>;
