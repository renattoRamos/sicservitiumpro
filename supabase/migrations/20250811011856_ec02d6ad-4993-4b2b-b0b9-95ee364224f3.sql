-- Fix migration: recreate storage policies without IF NOT EXISTS

-- Employees: ensure public RLS
DROP POLICY IF EXISTS "Employees delete for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees insert for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees select for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees update for authenticated users" ON public.employees;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public select on employees" ON public.employees FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public insert on employees" ON public.employees FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public update on employees" ON public.employees FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public delete on employees" ON public.employees FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('employees-photos', 'employees-photos', true)
on conflict (id) do nothing;

-- Drop then create storage policies scoped to the bucket
DROP POLICY IF EXISTS "Public read employees-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public upload employees-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public update employees-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete employees-photos" ON storage.objects;

CREATE POLICY "Public read employees-photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'employees-photos');

CREATE POLICY "Public upload employees-photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'employees-photos');

CREATE POLICY "Public update employees-photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'employees-photos');

CREATE POLICY "Public delete employees-photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'employees-photos');