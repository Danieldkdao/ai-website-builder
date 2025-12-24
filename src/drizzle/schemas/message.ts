import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { FragmentTable } from "./fragment";
import { ProjectTable } from "./project";

export const messageRoles = ["user", "assistant"] as const;
export type MessageRole = (typeof messageRoles)[number];
export const MessageRoleEnum = pgEnum("message_role", messageRoles);

export const messageTypes = ["result", "error"] as const;
export type MessageType = (typeof messageTypes)[number];
export const MessageTypeEnum = pgEnum("message_type", messageTypes);

export const MessageTable = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  projectId: uuid()
    .notNull()
    .references(() => ProjectTable.id, {
      onDelete: "cascade",
    }),
  content: varchar().notNull(),
  role: MessageRoleEnum().notNull(),
  type: MessageTypeEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const messagesRelations = relations(MessageTable, ({ one }) => ({
  fragment: one(FragmentTable, {
    fields: [MessageTable.id],
    references: [FragmentTable.messageId],
  }),
  project: one(ProjectTable, {
    fields: [MessageTable.projectId],
    references: [ProjectTable.id],
  }),
}));
