import { db } from "@/drizzle/db";
import { MessageTable, ProjectTable } from "@/drizzle/schema";
import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string().min(1, { error: "ID is required" }) }))
    .query(async ({ input }) => {
      const existingProject = await db.query.ProjectTable.findFirst({
        where: eq(ProjectTable.id, input.id),
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return existingProject;
    }),
  getMany: baseProcedure.query(async () => {
    const projects = await db.query.ProjectTable.findMany({
      orderBy: desc(ProjectTable.createdAt),
    });

    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { error: "Value is required" })
          .max(10000, { error: "Value is too long" }),
      })
    )
    .mutation(async ({ input }) => {
      const [createdProject] = await db
        .insert(ProjectTable)
        .values({
          name: generateSlug(2, {
            format: "kebab",
          }),
        })
        .returning();

      await db.insert(MessageTable).values({
        projectId: createdProject.id,
        content: input.value,
        role: "user",
        type: "result",
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),
});
