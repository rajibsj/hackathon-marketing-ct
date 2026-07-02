DO $$ BEGIN
  RAISE NOTICE 'Skipping demo seed phase 4: depends on phase 1 auth-backed seed data.';
END $$;
