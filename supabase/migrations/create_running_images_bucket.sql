-- Create running-images storage bucket if it doesn't exist
-- This bucket will store uploaded running app screenshots

-- Insert bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('running-images', 'running-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access for viewing images
CREATE POLICY IF NOT EXISTS "Public Access for Running Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'running-images');

-- Allow authenticated users to upload their own images
CREATE POLICY IF NOT EXISTS "Users can upload running images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'running-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete their running images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'running-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own images
CREATE POLICY IF NOT EXISTS "Users can update their running images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'running-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'running-images' AND (storage.foldername(name))[1] = auth.uid()::text);
