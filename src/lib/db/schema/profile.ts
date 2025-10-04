/**
 * Profile Schema
 * 사용자 프로필 및 About 페이지 데이터
 */

import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const profile = pgTable('profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // Supabase Auth user id와 연결

  // 기본 정보
  displayName: text('display_name').notNull(),
  jobTitle: text('job_title'),
  bio: text('bio'),
  profileImageUrl: text('profile_image_url'),

  // 상세 정보 (JSON)
  skills: jsonb('skills').$type<string[]>().default([]),
  socialLinks: jsonb('social_links').$type<{
    github?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    email?: string;
  }>().default({}),

  // 포트폴리오 항목
  portfolioItems: jsonb('portfolio_items').$type<Array<{
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    tags?: string[];
  }>>().default([]),

  // 타임스탬프
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
