import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const newsCategoryEnum = pgEnum('news_category', [
  'classic_rock',
  'metal',
  'punk',
  'alternative',
  'general',
]);

export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  summary: text('summary'),
  sourceUrl: text('source_url').notNull().unique(),
  thumbnailUrl: text('thumbnail_url'),
  category: newsCategoryEnum('category').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  crawledAt: timestamp('crawled_at').notNull().defaultNow(),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;
