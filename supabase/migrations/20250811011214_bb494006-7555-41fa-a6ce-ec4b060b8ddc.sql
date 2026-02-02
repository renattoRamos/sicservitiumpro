-- Fix linter issue: Set stable search_path on trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog, public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;