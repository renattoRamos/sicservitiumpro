-- Ensure updated_at trigger function exists (idempotent)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Ensure employees.id is auto-incrementing via a sequence (fixed setval)
DO $$
BEGIN
  -- Create the sequence if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'S' AND c.relname = 'employees_id_seq'
  ) THEN
    CREATE SEQUENCE public.employees_id_seq;
  END IF;

  -- Own the sequence to the column if not already
  PERFORM 1
  FROM pg_depend d
  JOIN pg_class s ON s.oid = d.objid AND s.relkind = 'S' AND s.relname = 'employees_id_seq'
  JOIN pg_class t ON t.oid = d.refobjid AND t.relname = 'employees'
  JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid AND a.attname = 'id';

  IF NOT FOUND THEN
    ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;
  END IF;

  -- Set sequence to at least 1 or current MAX(id)
  PERFORM setval(
    'public.employees_id_seq',
    GREATEST(
      COALESCE((SELECT MAX(id) FROM public.employees), 1),
      1
    ),
    true
  );

  -- Ensure column default is nextval of the sequence
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'id' AND column_default LIKE 'nextval%employees_id_seq%'
  ) THEN
    ALTER TABLE public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq');
  END IF;
END $$;

-- Ensure updated_at auto-updates on UPDATE
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Keep RLS enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;