import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  SALES_INBOX: z.string().email(),
  MAIL_FROM: z.string().email().default("catalogue@example.com"),
  EMAIL_PROVIDER: z.enum(["smtp", "console"]).default("smtp"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  PRODUCT_SOURCE: z.enum(["fakestore"]).default("fakestore"),
  FAKESTORE_BASE_URL: z.string().url().default("https://fakestoreapi.com"),
  CORS_ORIGINS: z.string().default(""),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = schema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid configuration:\n  ${problems.join("\n  ")}`);
  }
  return result.data;
}
