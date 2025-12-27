import {
  json,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { MessageTable } from "./message";
import { relations } from "drizzle-orm";

export const FragmentTable = pgTable("fragments", {
  id: uuid().primaryKey().defaultRandom(),
  messageId: uuid()
    .notNull()
    .references(() => MessageTable.id, {
      onDelete: "cascade",
    }),
  sandboxUrl: varchar().notNull(),
  title: varchar().notNull(),
  files: json(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const fragmentsRelations = relations(FragmentTable, ({ one }) => ({
  message: one(MessageTable, {
    fields: [FragmentTable.messageId],
    references: [MessageTable.id],
  }),
}));

export type FragmentType = typeof FragmentTable.$inferSelect;
