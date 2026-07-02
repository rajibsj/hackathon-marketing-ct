-- Demo seed data requires auth users and valid production UUIDs.
-- Skip on fresh databases; demo profiles are created by 20260224000000_setup_demo_credentials.sql.
DO $$ BEGIN
  RAISE NOTICE 'Skipping demo seed phase 1: create auth users first, then re-run or seed manually.';
END $$;
