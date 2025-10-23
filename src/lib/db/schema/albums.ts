import { pgTable, uuid, varchar, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { bands } from './bands';

export const albums = pgTable('albums', {
  id: uuid('id').primaryKey().defaultRandom(),
  bandId: uuid('band_id')
    .notNull()
    .references(() => bands.id),
  title: varchar('title', { length: 255 }).notNull(),
  coverUrl: text('cover_url'),
  releaseYear: integer('release_year'),
  label: varchar('label', { length: 100 }),
  genres: jsonb('genres').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
