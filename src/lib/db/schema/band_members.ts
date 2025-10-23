import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { bands } from './bands';
import { artists } from './artists';

export const bandMembers = pgTable('band_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  bandId: uuid('band_id')
    .notNull()
    .references(() => bands.id),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artists.id),
  position: varchar('position', { length: 100 }), // "Vocals", "Guitar", "Drums"
  joinYear: integer('join_year'),
  leaveYear: integer('leave_year'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type BandMember = typeof bandMembers.$inferSelect;
export type NewBandMember = typeof bandMembers.$inferInsert;
