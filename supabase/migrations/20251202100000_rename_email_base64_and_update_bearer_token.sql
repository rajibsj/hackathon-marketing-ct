-- Migration: Rename email_base64 to email (plain text) and update bearer_token storage
-- Changes:
-- 1. Rename email_base64 column to email (stores plain text email instead of base64 encoded)
-- 2. bearer_token now stores Base64-encoded JSON object

DO $$
BEGIN
  -- Triggers from 20251202073537 depend on email_base64; drop before column removal
  DROP TRIGGER IF EXISTS sync_bearer_token_on_insert ON public.activecollab_credentials;
  DROP TRIGGER IF EXISTS sync_bearer_token_on_update ON public.activecollab_credentials;
END $$;

-- Step 1: Create a new column for plain text email
ALTER TABLE public.activecollab_credentials
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Migrate existing data when legacy column still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'activecollab_credentials'
      AND column_name = 'email_base64'
  ) THEN
    UPDATE public.activecollab_credentials
    SET email = convert_from(decode(email_base64, 'base64'), 'UTF-8')
    WHERE email IS NULL AND email_base64 IS NOT NULL;
  END IF;
END $$;

-- Step 3: Make email column NOT NULL after migration (only if no NULLs remain)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'activecollab_credentials'
      AND column_name = 'email'
      AND is_nullable = 'YES'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.activecollab_credentials WHERE email IS NULL
  ) THEN
    ALTER TABLE public.activecollab_credentials
    ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- Step 4: Drop the old email_base64 column
ALTER TABLE public.activecollab_credentials
DROP COLUMN IF EXISTS email_base64;

-- Update column comments
COMMENT ON COLUMN public.activecollab_credentials.email IS 'Plain text email address used as username for Basic Auth (projects/tasks)';
COMMENT ON COLUMN public.activecollab_credentials.bearer_token IS 'Base64-encoded JSON object containing the email. Format: {"email": "user@example.com"} encoded as Base64. Used for fetching task comments.';

-- Update table comment
COMMENT ON TABLE public.activecollab_credentials IS 'Stores ActiveCollab API credentials. Only accessible by super admins. Email is stored as plain text, bearer_token is Base64-encoded JSON containing the email.';
