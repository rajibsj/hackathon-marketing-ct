-- ============================================================================
-- Bootstrap patch: fix users.id — add UUID default, drop premature FK
-- ============================================================================
-- The bootstrap migration (20250922000000) wrongly included a REFERENCES
-- auth.users(id) constraint and no DEFAULT on id. This caused two problems:
--   1. Seed INSERTs that omit id get a null violation (no gen_random_uuid default)
--   2. FK blocks inserting placeholder users not in auth.users
-- The FK is re-added correctly by migration 20251007213335 after the schema
-- stabilises, so we drop it here and let that migration restore it.
-- ============================================================================

-- Add default UUID generation so INSERTs without explicit id work
ALTER TABLE public.users
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Drop the premature FK (20251007213335 re-adds it properly later)
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_id_fkey;
