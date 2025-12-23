import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const envClient = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }
})