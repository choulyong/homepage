/**
 * Categories Schema
 * Based on LLD.md section 3.2.2
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

/**
 * Seed Data (to be inserted manually or via migration)
 * - ai_study (AI 스터디)
 * - bigdata_study (빅데이터처리기사 스터디)
 * - free_board (자유게시판)
 * - ai_artwork (AI 작품)
 */
