-- Add image_urls column to free_board table for multiple images
ALTER TABLE free_board ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Migrate existing single image_url to image_urls array
UPDATE free_board
SET image_urls = ARRAY[image_url]::text[]
WHERE image_url IS NOT NULL AND image_url != '';
