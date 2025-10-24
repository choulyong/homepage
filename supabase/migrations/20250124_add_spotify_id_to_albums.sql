-- Add spotify_id column to albums table
ALTER TABLE albums ADD COLUMN IF NOT EXISTS spotify_id VARCHAR(255) UNIQUE;

-- Add index for spotify_id
CREATE INDEX IF NOT EXISTS idx_albums_spotify_id ON albums(spotify_id);

-- Add spotify_url column as well
ALTER TABLE albums ADD COLUMN IF NOT EXISTS spotify_url TEXT;

-- Update comment
COMMENT ON COLUMN albums.spotify_id IS 'Spotify album ID for fetching track information';
