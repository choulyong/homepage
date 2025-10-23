import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { bands } from './bands';

export const youtubeVideos = pgTable('youtube_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  bandId: uuid('band_id').references(() => bands.id),
  videoId: varchar('video_id', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  channelName: varchar('channel_name', { length: 100 }),
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type YoutubeVideo = typeof youtubeVideos.$inferSelect;
export type NewYoutubeVideo = typeof youtubeVideos.$inferInsert;
