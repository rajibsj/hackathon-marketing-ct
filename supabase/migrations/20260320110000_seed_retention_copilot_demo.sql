-- =====================================================
-- Retention Copilot demo seed for existing hub clients
-- Targets: TechCorp, HealthcarePlus, RetailPlus, Global Manufacturing
-- Run: supabase db push --include-all  (or paste in SQL Editor)
-- =====================================================

-- Enrich client revenue context for LLM
UPDATE public.clients SET total_revenue = 75000,  monthly_billing = 5500, satisfaction_score = 95 WHERE name = 'TechCorp Solutions';
UPDATE public.clients SET total_revenue = 150000, monthly_billing = 9000, satisfaction_score = 82 WHERE name = 'HealthcarePlus';
UPDATE public.clients SET total_revenue = 120000, monthly_billing = 7500, satisfaction_score = 65 WHERE name = 'RetailPlus Inc';
UPDATE public.clients SET total_revenue = 85000,  monthly_billing = 7000, satisfaction_score = 42 WHERE name = 'Global Manufacturing';

-- ── TechCorp Solutions: HEALTHY ─────────────────────────
INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
SELECT
  'a1000001-0000-4000-8000-000000000001'::uuid, p.id, c.id,
  'Homepage redesign approved', 'Client signed off on final homepage mockups',
  'completed', 'high', CURRENT_DATE - 14, NOW() - INTERVAL '30 days', NOW() - INTERVAL '12 days'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'TechCorp Solutions'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
SELECT
  'a1000001-0000-4000-8000-000000000002'::uuid, p.id, c.id,
  'Blog content batch Q1', '8 SEO blogs delivered on schedule',
  'completed', 'medium', CURRENT_DATE - 7, NOW() - INTERVAL '25 days', NOW() - INTERVAL '8 days'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'TechCorp Solutions'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
SELECT
  'a1000001-0000-4000-8000-000000000003'::uuid, p.id, c.id,
  'Product pages development', 'Building 6 product landing pages',
  'in_progress', 'high', CURRENT_DATE + 14, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'TechCorp Solutions'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_meetings (project_id, meeting_id, meeting_title, start_time, end_time)
SELECT p.id, 'demo-tc-meeting-1', 'Bi-weekly check-in', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '45 minutes'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'TechCorp Solutions'
LIMIT 1
ON CONFLICT (project_id, meeting_id) DO NOTHING;

-- ── HealthcarePlus: STABLE / WATCH ──────────────────────
INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
SELECT
  'a1000002-0000-4000-8000-000000000001'::uuid, p.id, c.id,
  'Portal authentication module', 'OAuth integration completed',
  'completed', 'high', CURRENT_DATE - 20, NOW() - INTERVAL '40 days', NOW() - INTERVAL '18 days'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'HealthcarePlus'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
SELECT
  'a1000002-0000-4000-8000-000000000002'::uuid, p.id, c.id,
  'Appointment booking UI', 'Frontend screens in review',
  'in_progress', 'high', CURRENT_DATE + 7, NOW() - INTERVAL '20 days', NOW() - INTERVAL '4 days'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'HealthcarePlus'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
SELECT
  'a1000002-0000-4000-8000-000000000003'::uuid, p.id, c.id,
  'HIPAA compliance documentation', 'Security audit deliverable overdue',
  'in_progress', 'urgent', CURRENT_DATE - 5, NOW() - INTERVAL '35 days', NOW() - INTERVAL '6 days'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'HealthcarePlus'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_meetings (project_id, meeting_id, meeting_title, start_time, end_time)
SELECT p.id, 'demo-hp-meeting-1', 'Sprint review', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '1 hour'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'HealthcarePlus'
LIMIT 1
ON CONFLICT (project_id, meeting_id) DO NOTHING;

-- ── RetailPlus Inc: WATCH ─────────────────────────────────
INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000003-0000-4000-8000-000000000001'::uuid, p.id, c.id,
  'Checkout flow optimization', 'A/B test results pending client review',
  'in_progress', 'high', CURRENT_DATE - 8, NOW() - INTERVAL '30 days', NOW() - INTERVAL '18 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-b' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'RetailPlus Inc'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000003-0000-4000-8000-000000000002'::uuid, p.id, c.id,
  'March promotional email campaign', 'Campaign assets not delivered',
  'todo', 'high', CURRENT_DATE - 12, NOW() - INTERVAL '25 days', NOW() - INTERVAL '16 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-b' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'RetailPlus Inc'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000003-0000-4000-8000-000000000003'::uuid, p.id, c.id,
  'Mobile app product feed', 'Stale — no updates in 3 weeks',
  'blocked', 'medium', CURRENT_DATE + 5, NOW() - INTERVAL '45 days', NOW() - INTERVAL '22 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-b' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'RetailPlus Inc'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_task_comments (task_id, activecollab_comment_id, comment_body, created_by_name, created_at)
SELECT
  'a1000003-0000-4000-8000-000000000002'::uuid,
  'demo-rp-comment-1',
  'We are frustrated with the delay on the March campaign. Our leadership is concerned about missing the launch window.',
  'Sarah Johnson',
  NOW() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM public.project_tasks WHERE id = 'a1000003-0000-4000-8000-000000000002'::uuid)
ON CONFLICT (activecollab_comment_id) DO NOTHING;

INSERT INTO public.project_meetings (project_id, meeting_id, meeting_title, start_time, end_time)
SELECT p.id, 'demo-rp-meeting-1', 'Monthly business review', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days' + INTERVAL '1 hour'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'RetailPlus Inc'
LIMIT 1
ON CONFLICT (project_id, meeting_id) DO NOTHING;

-- RetailPlus traffic: mild -18% WoW drop
INSERT INTO public.brand_analytics_data (brand_id, data_type, date_range_start, date_range_end, metrics)
SELECT b.id, 'weekly', CURRENT_DATE - 14, CURRENT_DATE - 8, '{"sessions": 8200}'::jsonb
FROM public.brands b WHERE b.slug = 'brand-b' AND COALESCE(b.is_active, true) = true
  AND NOT EXISTS (
    SELECT 1 FROM public.brand_analytics_data bad
    WHERE bad.brand_id = b.id
      AND bad.date_range_start = CURRENT_DATE - 14
      AND bad.date_range_end = CURRENT_DATE - 8
  );

INSERT INTO public.brand_analytics_data (brand_id, data_type, date_range_start, date_range_end, metrics)
SELECT b.id, 'weekly', CURRENT_DATE - 7, CURRENT_DATE, '{"sessions": 6700}'::jsonb
FROM public.brands b WHERE b.slug = 'brand-b' AND COALESCE(b.is_active, true) = true
  AND NOT EXISTS (
    SELECT 1 FROM public.brand_analytics_data bad
    WHERE bad.brand_id = b.id
      AND bad.date_range_start = CURRENT_DATE - 7
      AND bad.date_range_end = CURRENT_DATE
  );

-- ── Global Manufacturing: CRITICAL (hero demo client) ─────
INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000004-0000-4000-8000-000000000001'::uuid, p.id, c.id,
  'Q1 product launch blog series', '4 of 6 blogs overdue',
  'in_progress', 'urgent', CURRENT_DATE - 18, NOW() - INTERVAL '50 days', NOW() - INTERVAL '4 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-a' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'Global Manufacturing'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000004-0000-4000-8000-000000000002'::uuid, p.id, c.id,
  'Paid social ad creatives', 'March ad set not delivered',
  'todo', 'urgent', CURRENT_DATE - 10, NOW() - INTERVAL '40 days', NOW() - INTERVAL '3 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-a' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'Global Manufacturing'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000004-0000-4000-8000-000000000003'::uuid, p.id, c.id,
  'Email nurture sequence', 'Sequence build stalled 3+ weeks',
  'blocked', 'high', CURRENT_DATE - 6, NOW() - INTERVAL '55 days', NOW() - INTERVAL '24 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-a' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'Global Manufacturing'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, brand_id)
SELECT
  'a1000004-0000-4000-8000-000000000004'::uuid, p.id, c.id,
  'Landing page for new product line', 'Client waiting on copy and design',
  'in_progress', 'high', CURRENT_DATE - 14, NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days',
  (SELECT id FROM public.brands WHERE slug = 'brand-a' AND COALESCE(is_active, true) = true LIMIT 1)
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'Global Manufacturing'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_task_comments (task_id, activecollab_comment_id, comment_body, created_by_name, created_at)
SELECT
  'a1000004-0000-4000-8000-000000000001'::uuid,
  'demo-gm-comment-1',
  'Publishing has completely stopped and leadership is very disappointed. We may need to escalate if this is not resolved this week.',
  'Lisa Wong',
  NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM public.project_tasks WHERE id = 'a1000004-0000-4000-8000-000000000001'::uuid)
ON CONFLICT (activecollab_comment_id) DO NOTHING;

INSERT INTO public.project_task_comments (task_id, activecollab_comment_id, comment_body, created_by_name, created_at)
SELECT
  'a1000004-0000-4000-8000-000000000002'::uuid,
  'demo-gm-comment-2',
  'Invoice for last month is still outstanding — please confirm when ads will go live.',
  'Lisa Wong',
  NOW() - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM public.project_tasks WHERE id = 'a1000004-0000-4000-8000-000000000002'::uuid)
ON CONFLICT (activecollab_comment_id) DO NOTHING;

INSERT INTO public.project_meetings (project_id, meeting_id, meeting_title, start_time, end_time)
SELECT p.id, 'demo-gm-meeting-1', 'Q1 campaign kickoff', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days' + INTERVAL '1 hour'
FROM public.clients c
JOIN public.projects p ON p.client_id = c.id
WHERE c.name = 'Global Manufacturing'
LIMIT 1
ON CONFLICT (project_id, meeting_id) DO NOTHING;

-- Global Manufacturing traffic: -38% WoW drop (hero narrative)
INSERT INTO public.brand_analytics_data (brand_id, data_type, date_range_start, date_range_end, metrics)
SELECT b.id, 'weekly', CURRENT_DATE - 14, CURRENT_DATE - 8, '{"sessions": 12500}'::jsonb
FROM public.brands b WHERE b.slug = 'brand-a' AND COALESCE(b.is_active, true) = true
  AND NOT EXISTS (
    SELECT 1 FROM public.brand_analytics_data bad
    WHERE bad.brand_id = b.id
      AND bad.date_range_start = CURRENT_DATE - 14
      AND bad.date_range_end = CURRENT_DATE - 8
  );

INSERT INTO public.brand_analytics_data (brand_id, data_type, date_range_start, date_range_end, metrics)
SELECT b.id, 'weekly', CURRENT_DATE - 7, CURRENT_DATE, '{"sessions": 7750}'::jsonb
FROM public.brands b WHERE b.slug = 'brand-a' AND COALESCE(b.is_active, true) = true
  AND NOT EXISTS (
    SELECT 1 FROM public.brand_analytics_data bad
    WHERE bad.brand_id = b.id
      AND bad.date_range_start = CURRENT_DATE - 7
      AND bad.date_range_end = CURRENT_DATE
  );
