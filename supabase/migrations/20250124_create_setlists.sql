-- Create setlists table for managing concert setlists
CREATE TABLE IF NOT EXISTS setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  venue VARCHAR(255),
  event_date DATE,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setlist_songs table for managing songs in a setlist
CREATE TABLE IF NOT EXISTS setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE NOT NULL,
  song_title VARCHAR(255) NOT NULL,
  song_order INTEGER NOT NULL,
  duration_seconds INTEGER,
  notes TEXT,
  is_encore BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_setlists_band_id ON setlists(band_id);
CREATE INDEX idx_setlists_concert_id ON setlists(concert_id);
CREATE INDEX idx_setlists_event_date ON setlists(event_date);
CREATE INDEX idx_setlist_songs_setlist_id ON setlist_songs(setlist_id);
CREATE INDEX idx_setlist_songs_order ON setlist_songs(setlist_id, song_order);

-- Add RLS policies
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;

-- Public can read public setlists
CREATE POLICY "Public setlists are viewable by everyone"
  ON setlists FOR SELECT
  USING (is_public = true);

-- Public can read songs from public setlists
CREATE POLICY "Public setlist songs are viewable by everyone"
  ON setlist_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM setlists
      WHERE setlists.id = setlist_songs.setlist_id
      AND setlists.is_public = true
    )
  );

-- Authenticated users can create setlists
CREATE POLICY "Authenticated users can create setlists"
  ON setlists FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can create setlist songs
CREATE POLICY "Authenticated users can create setlist songs"
  ON setlist_songs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own setlists (for now, all authenticated users)
CREATE POLICY "Authenticated users can update setlists"
  ON setlists FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Users can update setlist songs
CREATE POLICY "Authenticated users can update setlist songs"
  ON setlist_songs FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Users can delete setlists
CREATE POLICY "Authenticated users can delete setlists"
  ON setlists FOR DELETE
  USING (auth.role() = 'authenticated');

-- Users can delete setlist songs
CREATE POLICY "Authenticated users can delete setlist songs"
  ON setlist_songs FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_setlists_updated_at
  BEFORE UPDATE ON setlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
