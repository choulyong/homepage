import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { bands } from './bands';
import { concerts } from './concerts';

export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  bandId: uuid('band_id').references(() => bands.id),
  concertId: uuid('concert_id').references(() => concerts.id),
  fileUrl: text('file_url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
