import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { concerts } from './concerts';

export const concertReviews = pgTable('concert_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  concertId: uuid('concert_id')
    .notNull()
    .references(() => concerts.id),
  rating: integer('rating').notNull(), // 1-10
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type ConcertReview = typeof concertReviews.$inferSelect;
export type NewConcertReview = typeof concertReviews.$inferInsert;
