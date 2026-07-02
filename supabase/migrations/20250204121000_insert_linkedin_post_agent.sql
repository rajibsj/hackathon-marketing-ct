-- Insert LinkedIn Post Agent
-- Wrapped in a guard: on a fresh database ai_agents is created by later migrations.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_agents'
  ) THEN
    RAISE NOTICE 'Skipping 20250204121000: ai_agents table not yet created, will be seeded by later migrations.';
    RETURN;
  END IF;

  INSERT INTO public.ai_agents (name, slug, description, category, system_prompt, data_sources, config)
  SELECT
    'LinkedIn Post Agent',
    'linkedin-post-agent',
    'Creates LinkedIn posts using SJ Innovation voice, BuildYourAI updates, and brand tone.',
    'marketing',
    'You are the SJ Innovation LinkedIn Post Agent. Blend company knowledge, BuildYourAI updates, and Shahed Islam''s tone to craft engaging LinkedIn content that highlights AI-driven business growth.',
    '["company_knowledge", "mem0"]'::jsonb,
    jsonb_build_object(
      'model_provider', 'openai',
      'model_version', 'gpt-4o-mini',
      'fallback_provider', 'openai:gpt-4o-mini',
      'knowledge_collections', jsonb_build_array('marketing', 'brands/sjinnovation'),
      'tools_enabled', jsonb_build_array('mem0', 'chroma'),
      'instructions', 'Generate LinkedIn posts reflecting Shahed Islam''s style, tone, and focus on AI business growth.'
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM public.ai_agents WHERE slug = 'linkedin-post-agent'
  );
END $$;
