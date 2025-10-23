/**
 * Categories Schema - Rock Community Edition
 * Based on LLD.md section 3.2.11
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

/**
 * Rock Community Categories - Seed Data
 * - general_discussion (General Discussion)
 * - album_reviews (Album Reviews)
 * - concert_reviews (Concert Reviews)
 * - hot_topics (Hot Topics)
 * - rock_art (Rock Art Showcase)
 */
