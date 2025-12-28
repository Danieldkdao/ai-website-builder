import { db } from "@/drizzle/db";
import { MessageTable, ProjectTable } from "@/drizzle/schema";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1, { error: "ID is required" }) }))
    .query(async ({ input, ctx }) => {
      const existingProject = await db.query.ProjectTable.findFirst({
        where: and(
          eq(ProjectTable.id, input.id),
          eq(ProjectTable.userId, ctx.auth.userId)
        ),
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return existingProject;
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await db.query.ProjectTable.findMany({
      where: eq(ProjectTable.userId, ctx.auth.userId),
      orderBy: desc(ProjectTable.createdAt),
    });

    return projects;
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { error: "Value is required" })
          .max(10000, { error: "Value is too long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          console.log(error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        } else {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have run out of credits",
          });
        }
      }

      const [createdProject] = await db
        .insert(ProjectTable)
        .values({
          name: generateSlug(2, {
            format: "kebab",
          }),
          userId: ctx.auth.userId,
        })
        .returning();

      await db.insert(MessageTable).values({
        projectId: createdProject.id,
        content: input.value,
        role: "user",
        type: "result",
        userId: ctx.auth.userId,
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createdProject.id,
          userId: ctx.auth.userId,
        },
      });

      return createdProject;
    }),
});
