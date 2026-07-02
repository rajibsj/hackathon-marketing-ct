-- Client Health Copilot: snapshots table, denormalized client fields, AI agent seed

-- Denormalized fields on clients for fast portfolio queries
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  ADD COLUMN IF NOT EXISTS churn_risk_band TEXT CHECK (churn_risk_band IN ('healthy', 'stable', 'watch', 'critical', 'immediate')),
  ADD COLUMN IF NOT EXISTS last_health_analysis_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.client_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  churn_probability NUMERIC(4, 3) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 1),
  churn_window_days INTEGER,
  risk_band TEXT NOT NULL CHECK (risk_band IN ('healthy', 'stable', 'watch', 'critical', 'immediate')),
  summary TEXT,
  explanation TEXT,
  root_causes JSONB DEFAULT '[]'::jsonb,
  recovery_plan JSONB DEFAULT '[]'::jsonb,
  signals JSONB DEFAULT '{}'::jsonb,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  heuristic_score INTEGER,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_health_snapshots_client_id
  ON public.client_health_snapshots(client_id);

CREATE INDEX IF NOT EXISTS idx_client_health_snapshots_analyzed_at
  ON public.client_health_snapshots(analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_health_snapshots_client_analyzed
  ON public.client_health_snapshots(client_id, analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_churn_risk_band
  ON public.clients(churn_risk_band)
  WHERE churn_risk_band IS NOT NULL;

ALTER TABLE public.client_health_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PM and above can view client health snapshots" ON public.client_health_snapshots;
CREATE POLICY "PM and above can view client health snapshots"
  ON public.client_health_snapshots
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'pm'::app_role)
  );

-- Seed AI agent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_agents'
  ) THEN
    RAISE NOTICE 'Skipping client-retention-copilot agent seed: ai_agents table not yet created.';
    RETURN;
  END IF;

  INSERT INTO public.ai_agents (
    name, slug, description, category, system_prompt, is_enabled, required_role, data_sources, output_actions
  )
  VALUES (
    'Client Retention Copilot',
    'client-retention-copilot',
    'Autonomous account manager that monitors delivery signals, engagement, and analytics to predict churn and recommend recovery actions',
    'business_analysis',
    'You are an expert account manager and client retention specialist. Analyze fragmented client signals (delivery, engagement, analytics, revenue) and produce actionable churn risk assessments with prioritized recovery plans. Be specific, evidence-based, and direct. Focus on what will save the account.',
    true,
    'pm',
    '["clients", "project_tasks", "project_task_comments", "project_meetings", "brand_analytics_data", "projects"]'::jsonb,
    '{"create_tasks": true, "draft_email": true, "slack_notify": true}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    system_prompt = EXCLUDED.system_prompt,
    data_sources = EXCLUDED.data_sources,
    output_actions = EXCLUDED.output_actions,
    is_enabled = EXCLUDED.is_enabled;
END $$;
