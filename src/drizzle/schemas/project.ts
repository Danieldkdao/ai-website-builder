import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { MessageTable } from "./message";

export const ProjectTable = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  userId: varchar().notNull(),
  name: varchar().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const projectRelations = relations(ProjectTable, ({ many }) => ({
  messages: many(MessageTable),
}));
