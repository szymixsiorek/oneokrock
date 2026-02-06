
-- Add release_type column to albums table
ALTER TABLE public.albums ADD COLUMN release_type text NOT NULL DEFAULT 'Album' CHECK (release_type IN ('Album', 'Single'));
