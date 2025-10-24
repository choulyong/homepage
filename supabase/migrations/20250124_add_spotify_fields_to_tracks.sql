-- Add spotify fields to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(255) UNIQUE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- Add index for spotify_id
CREATE INDEX IF NOT EXISTS idx_tracks_spotify_id ON tracks(spotify_id);
