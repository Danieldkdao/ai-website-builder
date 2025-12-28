import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const UsageTable = pgTable("usages", {
  key: varchar().primaryKey(),
  points: integer().notNull(),
  expire: timestamp(),
});
