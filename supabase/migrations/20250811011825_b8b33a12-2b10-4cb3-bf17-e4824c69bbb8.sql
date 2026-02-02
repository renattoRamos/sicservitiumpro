-- Open RLS to everyone on employees and create a public storage bucket for photos

-- 1) Employees RLS: drop restrictive policies and create public ones
DROP POLICY IF EXISTS "Employees delete for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees insert for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees select for authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Employees update for authenticated users" ON public.employees;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select on employees"
ON public.employees
FOR SELECT
USING (true);

CREATE POLICY "Public insert on employees"
ON public.employees
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update on employees"
ON public.employees
FOR UPDATE
USING (true);

CREATE POLICY "Public delete on employees"
ON public.employees
FOR DELETE
USING (true);

-- 2) Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('employees-photos', 'employees-photos', true)
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage.objects (it is by default in Supabase)
-- Create public policies scoped to the bucket
CREATE POLICY IF NOT EXISTS "Public read employees-photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'employees-photos');

CREATE POLICY IF NOT EXISTS "Public upload employees-photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'employees-photos');

CREATE POLICY IF NOT EXISTS "Public update employees-photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'employees-photos');

CREATE POLICY IF NOT EXISTS "Public delete employees-photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'employees-photos');