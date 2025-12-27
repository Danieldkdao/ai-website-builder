import { db } from "@/drizzle/db";
import { MessageTable, ProjectTable } from "@/drizzle/schema";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import z from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await db.query.MessageTable.findMany({
        where: and(
          eq(MessageTable.projectId, input.projectId),
          eq(MessageTable.userId, ctx.auth.userId)
        ),
        orderBy: asc(MessageTable.createdAt),
        with: {
          fragment: true,
        },
      });

      return messages;
    }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { error: "Value is required" })
          .max(10000, { error: "Value is too long" }),
        projectId: z.string().min(1, { error: "Project ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await db.query.ProjectTable.findFirst({
        where: and(
          eq(ProjectTable.id, input.projectId),
          eq(ProjectTable.userId, ctx.auth.userId)
        ),
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const [createdMessage] = await db
        .insert(MessageTable)
        .values({
          projectId: existingProject.id,
          content: input.value,
          role: "user",
          type: "result",
          userId: ctx.auth.userId,
        })
        .returning();

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
          userId: ctx.auth.userId,
        },
      });

      return createdMessage;
    }),
});
