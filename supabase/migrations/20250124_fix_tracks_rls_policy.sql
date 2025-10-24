-- Fix missing RLS policies for tracks, artists, and band_members tables
-- These tables had RLS enabled but no SELECT policies, making them inaccessible

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
DROP POLICY IF EXISTS "Authenticated users can create tracks" ON tracks;
DROP POLICY IF EXISTS "Admins can update tracks" ON tracks;
DROP POLICY IF EXISTS "Admins can delete tracks" ON tracks;
DROP POLICY IF EXISTS "Artists are viewable by everyone" ON artists;
DROP POLICY IF EXISTS "Authenticated users can create artists" ON artists;
DROP POLICY IF EXISTS "Admins can update artists" ON artists;
DROP POLICY IF EXISTS "Admins can delete artists" ON artists;
DROP POLICY IF EXISTS "Band members are viewable by everyone" ON band_members;
DROP POLICY IF EXISTS "Authenticated users can create band members" ON band_members;
DROP POLICY IF EXISTS "Admins can update band members" ON band_members;
DROP POLICY IF EXISTS "Admins can delete band members" ON band_members;

-- Tracks: Everyone can view
CREATE POLICY "Tracks are viewable by everyone"
ON tracks FOR SELECT USING (true);

-- Tracks: Authenticated users can create
CREATE POLICY "Authenticated users can create tracks"
ON tracks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Tracks: Admins can update
CREATE POLICY "Admins can update tracks"
ON tracks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Tracks: Admins can delete
CREATE POLICY "Admins can delete tracks"
ON tracks FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Artists: Everyone can view
CREATE POLICY "Artists are viewable by everyone"
ON artists FOR SELECT USING (true);

-- Artists: Authenticated users can create
CREATE POLICY "Authenticated users can create artists"
ON artists FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Artists: Admins can update
CREATE POLICY "Admins can update artists"
ON artists FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Artists: Admins can delete
CREATE POLICY "Admins can delete artists"
ON artists FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Band members: Everyone can view
CREATE POLICY "Band members are viewable by everyone"
ON band_members FOR SELECT USING (true);

-- Band members: Authenticated users can create
CREATE POLICY "Authenticated users can create band members"
ON band_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Band members: Admins can update
CREATE POLICY "Admins can update band members"
ON band_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Band members: Admins can delete
CREATE POLICY "Admins can delete band members"
ON band_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'admin')
);

-- Add comment
COMMENT ON TABLE tracks IS 'Rock Community: Album tracks with RLS policies enabled';
