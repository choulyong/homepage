import { pgTable, uuid, varchar, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const bands = pgTable('bands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  logoUrl: text('logo_url'),
  country: varchar('country', { length: 100 }),
  formedYear: integer('formed_year'),
  genres: jsonb('genres').$type<string[]>(), // ["Hard Rock", "Heavy Metal"]
  socialLinks: jsonb('social_links').$type<Record<string, string>>(), // {facebook: "...", instagram: "..."}
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Band = typeof bands.$inferSelect;
export type NewBand = typeof bands.$inferInsert;
