-- Create enum for edition types
CREATE TYPE public.edition_type AS ENUM ('Japanese', 'International', 'Deluxe');

-- Create enum for lyrics language
CREATE TYPE public.lyrics_language AS ENUM ('JA', 'EN', 'Mixed');

-- Create albums table
CREATE TABLE public.albums (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    cover_url TEXT,
    release_date DATE,
    edition_type edition_type NOT NULL DEFAULT 'Japanese',
    accent_color TEXT DEFAULT '#ff0033',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tracks table
CREATE TABLE public.tracks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    mp3_url TEXT,
    track_number INTEGER NOT NULL DEFAULT 1,
    duration TEXT,
    artist TEXT NOT NULL DEFAULT 'ONE OK ROCK',
    featured_artist TEXT,
    lyrics_language lyrics_language NOT NULL DEFAULT 'JA',
    is_hidden_track BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Public read access for albums
CREATE POLICY "Public can view albums"
ON public.albums
FOR SELECT
USING (true);

-- Public read access for tracks
CREATE POLICY "Public can view tracks"
ON public.tracks
FOR SELECT
USING (true);

-- Authenticated users can insert albums
CREATE POLICY "Authenticated users can create albums"
ON public.albums
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update albums
CREATE POLICY "Authenticated users can update albums"
ON public.albums
FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete albums
CREATE POLICY "Authenticated users can delete albums"
ON public.albums
FOR DELETE
TO authenticated
USING (true);

-- Authenticated users can insert tracks
CREATE POLICY "Authenticated users can create tracks"
ON public.tracks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update tracks
CREATE POLICY "Authenticated users can update tracks"
ON public.tracks
FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete tracks
CREATE POLICY "Authenticated users can delete tracks"
ON public.tracks
FOR DELETE
TO authenticated
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON public.albums
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON public.tracks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for music files
INSERT INTO storage.buckets (id, name, public)
VALUES ('music', 'music', true);

-- Create storage bucket for album covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true);

-- Storage policies for music bucket (public read)
CREATE POLICY "Public can view music files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'music');

-- Storage policies for music bucket (authenticated upload)
CREATE POLICY "Authenticated users can upload music"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music');

-- Storage policies for music bucket (authenticated delete)
CREATE POLICY "Authenticated users can delete music"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'music');

-- Storage policies for covers bucket (public read)
CREATE POLICY "Public can view cover images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'covers');

-- Storage policies for covers bucket (authenticated upload)
CREATE POLICY "Authenticated users can upload covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'covers');

-- Storage policies for covers bucket (authenticated delete)
CREATE POLICY "Authenticated users can delete covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'covers');

-- Create index for faster track lookups by album
CREATE INDEX idx_tracks_album_id ON public.tracks(album_id);

-- Create index for track ordering
CREATE INDEX idx_tracks_order ON public.tracks(album_id, track_number);