-- Adoption Stats Export API — user activity tracking
-- Spec: CONTROL-TOWER-ADOPTION-STATS-EXPORT-API.md v1.0.0

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'page_view', 'action')),
  module_name TEXT,
  page_path TEXT,
  action_name TEXT,
  action_details JSONB DEFAULT '{}'::jsonb,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id
  ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at
  ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_created
  ON public.user_activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type
  ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_module
  ON public.user_activity_logs(module_name);

COMMENT ON TABLE public.user_activity_logs IS
  'Raw user activity events for Control Tower adoption stats export';

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON public.user_activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON public.user_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all activity logs"
  ON public.user_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_module_name TEXT DEFAULT NULL,
  p_page_path TEXT DEFAULT NULL,
  p_action_name TEXT DEFAULT NULL,
  p_action_details JSONB DEFAULT '{}'::jsonb,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() IS DISTINCT FROM p_user_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    ) THEN
      RAISE EXCEPTION 'Cannot log activity for another user';
    END IF;
  END IF;

  INSERT INTO user_activity_logs (
    user_id, activity_type, module_name,
    page_path, action_name, action_details, session_id
  )
  VALUES (
    p_user_id, p_activity_type, p_module_name,
    p_page_path, p_action_name, p_action_details, p_session_id
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to log user activity: %', SQLERRM;
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.log_user_activity IS
  'Logs a user activity event for adoption metrics (login, page_view, action)';

GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
