import { EventSchemas, Inngest } from "inngest";
import z from "zod";

export const codeAgentRunDataSchema = z.object({
  value: z.string(),
  projectId: z.string(),
  userId: z.string(),
});

export const inngest = new Inngest({
  id: "ai-course-generator",
  schemas: new EventSchemas().fromSchema({
    "code-agent/run": codeAgentRunDataSchema,
  }),
});
