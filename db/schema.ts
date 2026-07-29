import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const translationUsage = sqliteTable(
  "translation_usage",
  {
    visitorKey: text("visitor_key").notNull(),
    usageDate: text("usage_date").notNull(),
    requestCount: integer("request_count").notNull().default(0),
    minuteBucket: integer("minute_bucket").notNull().default(0),
    minuteCount: integer("minute_count").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.visitorKey, table.usageDate] })],
);
