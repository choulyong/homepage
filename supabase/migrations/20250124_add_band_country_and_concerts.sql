-- Add country and popularity fields to bands table
-- 밴드 테이블에 국가 및 인기도 필드 추가

-- Add columns to bands table
ALTER TABLE bands
ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(100), -- Spotify artist ID
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS spotify_followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spotify_popularity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS origin VARCHAR(200), -- Spotify artist origin
ADD COLUMN IF NOT EXISTS image_url TEXT; -- Band image from Spotify

-- Create unique index for spotify_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_bands_spotify_id ON bands(spotify_id) WHERE spotify_id IS NOT NULL;

-- Create index for country-based queries
CREATE INDEX IF NOT EXISTS idx_bands_country ON bands(country);
CREATE INDEX IF NOT EXISTS idx_bands_popularity ON bands(spotify_popularity DESC);
CREATE INDEX IF NOT EXISTS idx_bands_followers ON bands(spotify_followers DESC);

-- Drop existing concerts table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS concerts CASCADE;

-- Create concerts table
CREATE TABLE concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  venue VARCHAR(300),
  city VARCHAR(100),
  country VARCHAR(100),
  event_date TIMESTAMP WITH TIME ZONE,
  ticket_url TEXT,
  youtube_url TEXT,
  youtube_playlist_url TEXT,
  poster_url TEXT,
  description TEXT,
  past_event BOOLEAN DEFAULT false,
  created_by VARCHAR(20) DEFAULT 'admin', -- 'admin' or 'auto'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for concerts
CREATE INDEX IF NOT EXISTS idx_concerts_band_id ON concerts(band_id);
CREATE INDEX IF NOT EXISTS idx_concerts_event_date ON concerts(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_concerts_country ON concerts(country);
CREATE INDEX IF NOT EXISTS idx_concerts_past_event ON concerts(past_event);

-- Enable RLS on concerts table
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for concerts
DROP POLICY IF EXISTS "Concerts are viewable by everyone" ON concerts;
CREATE POLICY "Concerts are viewable by everyone"
ON concerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert concerts" ON concerts;
CREATE POLICY "Admins can insert concerts"
ON concerts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update concerts" ON concerts;
CREATE POLICY "Admins can update concerts"
ON concerts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can delete concerts" ON concerts;
CREATE POLICY "Admins can delete concerts"
ON concerts FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Add comments
COMMENT ON TABLE concerts IS 'Rock Community: Concert information with YouTube links';
COMMENT ON COLUMN bands.country IS 'Band country/nationality';
COMMENT ON COLUMN bands.spotify_followers IS 'Spotify total followers count';
COMMENT ON COLUMN bands.spotify_popularity IS 'Spotify popularity score (0-100)';
