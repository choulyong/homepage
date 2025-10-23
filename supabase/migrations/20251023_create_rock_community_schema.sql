-- Rock Community Schema Migration
-- Created: 2025-10-23
-- Phase 1: Core tables for bands, albums, concerts, reviews, and media

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles (if not exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- News categories
CREATE TYPE news_category AS ENUM ('classic_rock', 'metal', 'punk', 'alternative', 'general');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Alter users table to add Rock Community fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_genres JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bands table
CREATE TABLE IF NOT EXISTS bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  logo_url TEXT,
  country VARCHAR(100),
  formed_year INTEGER,
  genres JSONB,
  social_links JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  cover_url TEXT,
  release_year INTEGER,
  label VARCHAR(100),
  genres JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration_seconds INTEGER
);

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  birth_date DATE,
  country VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Band members (junction table)
CREATE TABLE IF NOT EXISTS band_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  position VARCHAR(100),
  join_year INTEGER,
  leave_year INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  band_id UUID REFERENCES bands(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Concerts table
CREATE TABLE IF NOT EXISTS concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  country VARCHAR(100),
  event_date TIMESTAMP NOT NULL,
  ticket_url TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Album reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Concert reviews table
CREATE TABLE IF NOT EXISTS concert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Comments table (if not exists)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MEDIA TABLES
-- ============================================================================

-- Rock news table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  category news_category NOT NULL,
  published_at TIMESTAMP NOT NULL,
  crawled_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Photo gallery table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  band_id UUID REFERENCES bands(id) ON DELETE SET NULL,
  concert_id UUID REFERENCES concerts(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- YouTube videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE SET NULL,
  video_id VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  thumbnail_url TEXT NOT NULL,
  channel_name VARCHAR(100),
  published_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Bands indexes
CREATE INDEX IF NOT EXISTS idx_bands_name ON bands(name);
CREATE INDEX IF NOT EXISTS idx_bands_country ON bands(country);
CREATE INDEX IF NOT EXISTS idx_bands_created_at ON bands(created_at DESC);

-- Albums indexes
CREATE INDEX IF NOT EXISTS idx_albums_band_id ON albums(band_id);
CREATE INDEX IF NOT EXISTS idx_albums_release_year ON albums(release_year DESC);

-- Tracks indexes
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON tracks(album_id);

-- Artists indexes
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Band members indexes
CREATE INDEX IF NOT EXISTS idx_band_members_band_id ON band_members(band_id);
CREATE INDEX IF NOT EXISTS idx_band_members_artist_id ON band_members(artist_id);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_band_id ON posts(band_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Concerts indexes
CREATE INDEX IF NOT EXISTS idx_concerts_band_id ON concerts(band_id);
CREATE INDEX IF NOT EXISTS idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_concerts_city ON concerts(city);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_album_id ON reviews(album_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Concert reviews indexes
CREATE INDEX IF NOT EXISTS idx_concert_reviews_concert_id ON concert_reviews(concert_id);
CREATE INDEX IF NOT EXISTS idx_concert_reviews_user_id ON concert_reviews(user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source_url ON news(source_url);

-- Photos indexes
CREATE INDEX IF NOT EXISTS idx_photos_band_id ON photos(band_id);
CREATE INDEX IF NOT EXISTS idx_photos_concert_id ON photos(concert_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- YouTube videos indexes
CREATE INDEX IF NOT EXISTS idx_youtube_videos_band_id ON youtube_videos(band_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_video_id ON youtube_videos(video_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE concert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can view, only admins can modify
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Posts: Everyone can view, authenticated users can create, users can update/delete their own
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid()::text = user_id);

-- Bands: Everyone can view, authenticated users can create, admins can update/delete
CREATE POLICY "Bands are viewable by everyone" ON bands FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bands" ON bands FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update bands" ON bands FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Admins can delete bands" ON bands FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Albums: Everyone can view, authenticated users can create, admins can update/delete
CREATE POLICY "Albums are viewable by everyone" ON albums FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create albums" ON albums FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update albums" ON albums FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Reviews: Everyone can view, authenticated users can create/update their own
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid()::text = user_id);

-- Concert reviews: Same as album reviews
CREATE POLICY "Concert reviews are viewable by everyone" ON concert_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create concert reviews" ON concert_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own concert reviews" ON concert_reviews FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own concert reviews" ON concert_reviews FOR DELETE USING (auth.uid()::text = user_id);

-- Concerts: Everyone can view, authenticated users can create
CREATE POLICY "Concerts are viewable by everyone" ON concerts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create concerts" ON concerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own concerts" ON concerts FOR UPDATE USING (auth.uid()::text = created_by_user_id);

-- News: Everyone can view, only service role can insert (for Edge Functions)
CREATE POLICY "News are viewable by everyone" ON news FOR SELECT USING (true);

-- Photos: Everyone can view, authenticated users can upload their own
CREATE POLICY "Photos are viewable by everyone" ON photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload photos" ON photos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own photos" ON photos FOR DELETE USING (auth.uid()::text = user_id);

-- YouTube videos: Everyone can view, only service role can insert
CREATE POLICY "YouTube videos are viewable by everyone" ON youtube_videos FOR SELECT USING (true);

-- Comments: Everyone can view, authenticated users can create/update their own
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================================================
-- SEED DATA: Rock Community Categories
-- ============================================================================

INSERT INTO categories (name, slug, description) VALUES
  ('General Discussion', 'general_discussion', 'General rock music discussions'),
  ('Album Reviews', 'album_reviews', 'Share your album reviews'),
  ('Concert Reviews', 'concert_reviews', 'Post-concert experiences'),
  ('Hot Topics', 'hot_topics', 'Trending discussions in rock'),
  ('Rock Art Showcase', 'rock_art', 'Share rock-themed artwork')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON TABLE bands IS 'Rock Community: Band information and profiles';
COMMENT ON TABLE albums IS 'Rock Community: Album catalog';
COMMENT ON TABLE concerts IS 'Rock Community: Concert events and schedules';
COMMENT ON TABLE reviews IS 'Rock Community: Album reviews by users';
COMMENT ON TABLE news IS 'Rock Community: Aggregated rock news from various sources';
