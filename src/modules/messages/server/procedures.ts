import { db } from "@/drizzle/db";
import { MessageTable } from "@/drizzle/schema";
import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { asc } from "drizzle-orm";
import z from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const messages = await db.query.MessageTable.findMany({
      orderBy: asc(MessageTable.createdAt),
      with: {
        fragment: true,
      },
    });

    return messages;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { error: "Message is required" }),
      })
    )
    .mutation(async ({ input }) => {
      const [createdMessage] = await db
        .insert(MessageTable)
        .values({
          content: input.value,
          role: "user",
          type: "result",
        })
        .returning();

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
        },
      });

      return createdMessage;
    }),
});
