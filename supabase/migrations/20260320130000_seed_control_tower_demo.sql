-- =====================================================
-- Control Tower demo seed for "Import from Control Tower"
-- Provides searchable demo projects when external CT API
-- credentials are not configured (hackathon / local demo).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.control_tower_demo_projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT DEFAULT 'medium',
  manager TEXT,
  team TEXT,
  budget NUMERIC,
  actual_cost NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  team_member_ids UUID[] DEFAULT '{}',
  manager_id UUID,
  project_manager_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.control_tower_demo_projects IS
  'Demo Control Tower project catalog for local/hackathon import without external API';

ALTER TABLE public.control_tower_demo_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read demo CT projects" ON public.control_tower_demo_projects;
CREATE POLICY "Authenticated users can read demo CT projects"
  ON public.control_tower_demo_projects
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role manages demo CT projects" ON public.control_tower_demo_projects;
CREATE POLICY "Service role manages demo CT projects"
  ON public.control_tower_demo_projects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Demo catalog (searchable via Import from Control Tower) ──
INSERT INTO public.control_tower_demo_projects (
  id, name, description, status, progress, priority, manager, team, budget, actual_cost, start_date, end_date
) VALUES
(
  'c1000001-0000-4000-8000-000000000001',
  'Website Redesign',
  'Complete overhaul of corporate website with modern design, CMS migration, and performance optimization.',
  'active', 65, 'high', 'Priya Sharma', 'Design, Dev, QA', 75000, 42000,
  CURRENT_DATE - 45, CURRENT_DATE + 30
),
(
  'c1000001-0000-4000-8000-000000000002',
  'Patient Portal System',
  'HIPAA-aware patient portal for appointment booking, records access, and secure messaging.',
  'active', 80, 'high', 'James Wilson', 'Healthcare Pod', 150000, 98000,
  CURRENT_DATE - 90, CURRENT_DATE + 45
),
(
  'c1000001-0000-4000-8000-000000000003',
  'E-commerce Platform',
  'Headless commerce build with mobile checkout, inventory sync, and analytics instrumentation.',
  'active', 40, 'medium', 'Sarah Johnson', 'Commerce Squad', 120000, 38000,
  CURRENT_DATE - 30, CURRENT_DATE + 60
),
(
  'c1000001-0000-4000-8000-000000000004',
  'Digital Marketing Campaign',
  'Multi-channel Q1 launch campaign across paid search, LinkedIn, and email nurture.',
  'planning', 15, 'high', 'Lisa Wong', 'Growth Team', 85000, 12000,
  CURRENT_DATE - 14, CURRENT_DATE + 75
),
(
  'c1000001-0000-4000-8000-000000000005',
  'AI Content Automation Hub',
  'Agentic content pipeline for blogs, newsletters, and social with human-in-the-loop review.',
  'active', 25, 'high', 'Anik Rahman', 'AI Marketing', 95000, 18000,
  CURRENT_DATE - 7, CURRENT_DATE + 90
),
(
  'c1000001-0000-4000-8000-000000000006',
  'Enterprise SEO Retainer',
  'Technical SEO, content clusters, and monthly reporting for enterprise SaaS client.',
  'active', 55, 'medium', 'Maria Chen', 'SEO Pod', 60000, 28000,
  CURRENT_DATE - 60, CURRENT_DATE + 120
),
(
  'c1000001-0000-4000-8000-000000000007',
  'Customer Success Portal v2',
  'Self-serve onboarding hub with health scores, playbooks, and renewal workflows.',
  'project-queue', 5, 'urgent', 'David Park', 'CS Engineering', 110000, 5000,
  CURRENT_DATE + 7, CURRENT_DATE + 120
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  progress = EXCLUDED.progress,
  priority = EXCLUDED.priority,
  manager = EXCLUDED.manager,
  team = EXCLUDED.team,
  budget = EXCLUDED.budget,
  actual_cost = EXCLUDED.actual_cost,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  updated_at = NOW();

-- Link existing hub projects so they appear as Control Tower imports
UPDATE public.projects
SET
  control_tower_project_id = 'c1000001-0000-4000-8000-000000000001',
  control_tower_last_synced_at = NOW()
WHERE name = 'Website Redesign'
  AND control_tower_project_id IS NULL;

UPDATE public.projects
SET
  control_tower_project_id = 'c1000001-0000-4000-8000-000000000002',
  control_tower_last_synced_at = NOW()
WHERE name = 'Patient Portal System'
  AND control_tower_project_id IS NULL;

UPDATE public.projects
SET
  control_tower_project_id = 'c1000001-0000-4000-8000-000000000003',
  control_tower_last_synced_at = NOW()
WHERE name = 'E-commerce Platform'
  AND control_tower_project_id IS NULL;

UPDATE public.projects
SET
  control_tower_project_id = 'c1000001-0000-4000-8000-000000000004',
  control_tower_last_synced_at = NOW()
WHERE name = 'Digital Marketing Campaign'
  AND control_tower_project_id IS NULL;
