/**
 * Posts Schema - Rock Community Edition
 * Based on LLD.md section 3.2.10
 */

import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';
import { bands } from './bands';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  bandId: uuid('band_id').references(() => bands.id), // 밴드 관련 글일 경우
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
