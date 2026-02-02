-- Secure employees table with RLS and authenticated-only access

-- 1) Enable RLS on the employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- 2) Drop any existing policies to avoid conflicts
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employees'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.employees', pol.policyname);
  END LOOP;
END $$;

-- 3) Create strict policies: only authenticated users can read/write
CREATE POLICY "Employees select for authenticated users"
ON public.employees
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Employees insert for authenticated users"
ON public.employees
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Employees update for authenticated users"
ON public.employees
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Employees delete for authenticated users"
ON public.employees
FOR DELETE
USING (auth.role() = 'authenticated');

-- 4) Ensure updated_at column stays fresh when present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'set_employees_updated_at'
    ) THEN
      CREATE TRIGGER set_employees_updated_at
      BEFORE UPDATE ON public.employees
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
    END IF;
  END IF;
END $$;