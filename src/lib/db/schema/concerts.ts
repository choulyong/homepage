import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { bands } from './bands';
import { users } from './users';

export const concerts = pgTable('concerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  bandId: uuid('band_id')
    .notNull()
    .references(() => bands.id),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  venue: varchar('venue', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  eventDate: timestamp('event_date').notNull(),
  ticketUrl: text('ticket_url'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Concert = typeof concerts.$inferSelect;
export type NewConcert = typeof concerts.$inferInsert;
