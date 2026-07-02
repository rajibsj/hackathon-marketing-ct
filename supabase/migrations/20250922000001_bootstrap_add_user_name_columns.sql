-- ============================================================================
-- Bootstrap patch: add first_name / last_name to public.users
-- ============================================================================
-- These columns were on the original manually-created users table but were
-- missed in the initial bootstrap migration (20250922000000). Migration
-- 20250923235243 inserts rows using these columns so they must exist first.
-- ============================================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT;
