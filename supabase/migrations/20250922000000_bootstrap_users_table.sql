-- ============================================================================
-- Bootstrap: Create initial public.users table
-- ============================================================================
-- On the original Supabase project this table was created manually in the
-- Supabase UI before any migration files existed. All subsequent migrations
-- assume it already exists and only ALTER it. This migration recreates that
-- initial state so the migration chain runs cleanly on a fresh database.
--
-- Column lifecycle (tracked across later migrations):
--   role             TEXT → altered to app_role (20250923232122) → dropped (20251010065045)
--   password_hash    TEXT NOT NULL → made nullable (20250926195046) → dropped (20251010065045)
--   refresh_token    TEXT → dropped (20251010065045)
--   refresh_token_expires_at TIMESTAMPTZ → dropped (20251010065045)
--   status           TEXT → added (20250923232858) — but we pre-create it here with IF NOT EXISTS safety
--   avatar_url       TEXT → added (20260224103957)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                    TEXT UNIQUE NOT NULL,
  first_name               TEXT,
  last_name                TEXT,
  role                     TEXT NOT NULL DEFAULT 'user',
  password_hash            TEXT NOT NULL DEFAULT '',
  refresh_token            TEXT,
  refresh_token_expires_at TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
