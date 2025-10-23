import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { albums } from './albums';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  albumId: uuid('album_id')
    .notNull()
    .references(() => albums.id),
  rating: integer('rating').notNull(), // 1-10
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
