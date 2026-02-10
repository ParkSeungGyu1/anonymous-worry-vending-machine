import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const worries = pgTable("worries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  nickname: text("nickname").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cheers = pgTable("cheers", {
  id: serial("id").primaryKey(),
  worryId: integer("worry_id").references(() => worries.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorrySchema = createInsertSchema(worries).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCheerSchema = createInsertSchema(cheers).omit({ 
  id: true, 
  createdAt: true 
});

export type Worry = typeof worries.$inferSelect;
export type InsertWorry = z.infer<typeof insertWorrySchema>;
export type Cheer = typeof cheers.$inferSelect;
export type InsertCheer = z.infer<typeof insertCheerSchema>;
