import { pgTable, uuid, varchar, text, timestamp, date } from 'drizzle-orm/pg-core';

export const artists = pgTable('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  birthDate: date('birth_date'),
  country: varchar('country', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
