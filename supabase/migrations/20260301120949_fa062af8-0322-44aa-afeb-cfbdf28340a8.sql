
-- Add slug column to albums
ALTER TABLE public.albums ADD COLUMN slug TEXT UNIQUE;

-- Populate slugs from existing titles
UPDATE public.albums SET slug = lower(replace(replace(replace(title, ' ', '-'), '×', '-'), '=', '')) WHERE slug IS NULL;

-- Make slug NOT NULL after population
ALTER TABLE public.albums ALTER COLUMN slug SET NOT NULL;
