DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated users can create albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can update albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can delete albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can create tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can update tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can delete tracks" ON public.tracks;

DROP POLICY IF EXISTS "Authenticated users can upload music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete covers" ON storage.objects;

COMMENT ON TABLE public.user_roles IS 'Privileged application roles; admin writes are additionally IP-gated in the admin-api edge function.';