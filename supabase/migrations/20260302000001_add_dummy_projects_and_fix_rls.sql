-- =====================================================
-- Fix projects RLS to allow all authenticated users to view projects
-- Dummy project seed skipped on fresh DBs (missing clients / slug constraint)
-- =====================================================

DROP POLICY IF EXISTS "Users view projects" ON public.projects;

CREATE POLICY "Users view projects" ON public.projects
FOR SELECT USING (auth.uid() IS NOT NULL);

DO $$ BEGIN
  RAISE NOTICE 'Skipping dummy project/task seed: requires demo clients and optional slug unique index.';
END $$;
