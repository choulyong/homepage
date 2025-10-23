import { pgTable, uuid, varchar, integer } from 'drizzle-orm/pg-core';
import { albums } from './albums';

export const tracks = pgTable('tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  albumId: uuid('album_id')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade' }),
  trackNumber: integer('track_number').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  durationSeconds: integer('duration_seconds'),
});

export type Track = typeof tracks.$inferSelect;
export type NewTrack = typeof tracks.$inferInsert;
