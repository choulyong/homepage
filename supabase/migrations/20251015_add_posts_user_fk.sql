-- Add foreign key relationship between posts.user_id and users.id
-- This allows Supabase to perform JOIN queries using select syntax

-- First check if the foreign key already exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE posts
    ADD CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

    RAISE NOTICE 'Foreign key posts_user_id_fkey created successfully';
  ELSE
    RAISE NOTICE 'Foreign key posts_user_id_fkey already exists';
  END IF;
END
$$;

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
