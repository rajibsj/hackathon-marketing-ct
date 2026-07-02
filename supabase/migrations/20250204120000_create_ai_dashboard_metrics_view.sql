-- Create AI dashboard metrics view
-- Wrapped in a guard: on a fresh database ai_agent_runs is created by later migrations.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_agent_runs'
  ) THEN
    RAISE NOTICE 'Skipping 20250204120000: ai_agent_runs table not yet created, view will be created by later migrations.';
    RETURN;
  END IF;

  CREATE OR REPLACE VIEW public.ai_dashboard_metrics AS
  SELECT
    agent_id,
    (SELECT name FROM public.ai_agents WHERE ai_agents.id = ai_agent_runs.agent_id) AS agent_name,
    count(*)::bigint AS total_runs,
    coalesce(sum((ai_summary->'provider_meta'->>'total_tokens')::numeric), 0)::bigint AS total_tokens,
    coalesce(avg((ai_summary->'provider_meta'->>'total_tokens')::numeric), 0) AS avg_tokens,
    max(created_at) AS last_run_at
  FROM public.ai_agent_runs
  WHERE status = 'completed'
  GROUP BY agent_id;
END $$;
