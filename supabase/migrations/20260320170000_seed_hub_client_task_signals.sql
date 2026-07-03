-- =====================================================
-- Hub client task signals: due dates, statuses, comments
-- Powers Retention Copilot overdue / stale / sentiment analysis
-- Idempotent: safe to re-run (upserts by fixed task + comment IDs)
-- =====================================================

-- ── 1. Upsert core demo tasks (retention copilot narrative) ──────────────
INSERT INTO public.project_tasks (
  id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, category
)
SELECT
  v.task_id,
  v.project_id,
  c.id,
  v.title,
  v.description,
  v.status,
  v.priority,
  v.due_date,
  v.created_at,
  v.updated_at,
  'clients'
FROM (VALUES
  -- TechCorp Solutions (healthy)
  (
    'a1000001-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000001'::uuid,
    'TechCorp Solutions',
    'Homepage redesign approved',
    'Client signed off on final homepage mockups',
    'completed', 'high', CURRENT_DATE - 14,
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '12 days'
  ),
  (
    'a1000001-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000002'::uuid,
    'TechCorp Solutions',
    'Blog content batch Q1',
    '8 SEO blogs delivered on schedule',
    'completed', 'medium', CURRENT_DATE - 7,
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '8 days'
  ),
  (
    'a1000001-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000001'::uuid,
    'TechCorp Solutions',
    'Product pages development',
    'Building 6 product landing pages',
    'in_progress', 'high', CURRENT_DATE + 14,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'
  ),
  (
    'f0050001-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000002'::uuid,
    'TechCorp Solutions',
    'Q2 keyword cluster map',
    'SEO keyword research for product launch pages',
    'review', 'medium', CURRENT_DATE + 5,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'
  ),

  -- HealthcarePlus (stable / watch)
  (
    'a1000002-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'HealthcarePlus',
    'Portal authentication module',
    'OAuth integration completed',
    'completed', 'high', CURRENT_DATE - 20,
    NOW() - INTERVAL '40 days', NOW() - INTERVAL '18 days'
  ),
  (
    'a1000002-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'HealthcarePlus',
    'Appointment booking UI',
    'Frontend screens in review',
    'in_progress', 'high', CURRENT_DATE + 7,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '4 days'
  ),
  (
    'a1000002-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'HealthcarePlus',
    'HIPAA compliance documentation',
    'Security audit deliverable overdue',
    'in_progress', 'urgent', CURRENT_DATE - 5,
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '6 days'
  ),
  (
    'f0050001-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000004'::uuid,
    'HealthcarePlus',
    'Telehealth video visit QA',
    'End-to-end testing for iOS video sessions',
    'todo', 'high', CURRENT_DATE + 10,
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days'
  ),

  -- RetailPlus Inc (watch)
  (
    'a1000003-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000008'::uuid,
    'RetailPlus Inc',
    'Checkout flow optimization',
    'A/B test results pending client review',
    'in_progress', 'high', CURRENT_DATE - 8,
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '18 days'
  ),
  (
    'a1000003-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000008'::uuid,
    'RetailPlus Inc',
    'March promotional email campaign',
    'Campaign assets not delivered',
    'todo', 'high', CURRENT_DATE - 12,
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '16 days'
  ),
  (
    'a1000003-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000010'::uuid,
    'RetailPlus Inc',
    'Mobile app product feed',
    'Stale — no updates in 3 weeks',
    'blocked', 'medium', CURRENT_DATE + 5,
    NOW() - INTERVAL '45 days', NOW() - INTERVAL '22 days'
  ),

  -- Global Manufacturing (critical)
  (
    'a1000004-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'Global Manufacturing',
    'Q1 product launch blog series',
    '4 of 6 blogs overdue',
    'in_progress', 'urgent', CURRENT_DATE - 18,
    NOW() - INTERVAL '50 days', NOW() - INTERVAL '4 days'
  ),
  (
    'a1000004-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'Global Manufacturing',
    'Paid social ad creatives',
    'March ad set not delivered',
    'todo', 'urgent', CURRENT_DATE - 10,
    NOW() - INTERVAL '40 days', NOW() - INTERVAL '3 days'
  ),
  (
    'a1000004-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'Global Manufacturing',
    'Email nurture sequence',
    'Sequence build stalled 3+ weeks',
    'blocked', 'high', CURRENT_DATE - 6,
    NOW() - INTERVAL '55 days', NOW() - INTERVAL '24 days'
  ),
  (
    'a1000004-0000-4000-8000-000000000004'::uuid,
    'a2000001-0000-4000-8000-000000000012'::uuid,
    'Global Manufacturing',
    'Landing page for new product line',
    'Client waiting on copy and design',
    'in_progress', 'high', CURRENT_DATE - 14,
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days'
  ),

  -- StartupXYZ (healthy) — dedicated IDs (fixes UUID collision from hub cleanup)
  (
    'f0050001-0000-4000-8000-000000000010'::uuid,
    'a2000001-0000-4000-8000-000000000005'::uuid,
    'StartupXYZ',
    'Brand guidelines final delivery',
    'Logo system and typography package delivered',
    'completed', 'medium', CURRENT_DATE - 30,
    NOW() - INTERVAL '90 days', NOW() - INTERVAL '28 days'
  ),
  (
    'f0050001-0000-4000-8000-000000000011'::uuid,
    'a2000001-0000-4000-8000-000000000006'::uuid,
    'StartupXYZ',
    'Pitch deck narrative outline',
    'CEO story arc and traction slides',
    'in_progress', 'urgent', CURRENT_DATE + 7,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
  ),
  (
    'f0050001-0000-4000-8000-000000000012'::uuid,
    'a2000001-0000-4000-8000-000000000006'::uuid,
    'StartupXYZ',
    'Financial model one-pager',
    'Investor appendix with unit economics',
    'todo', 'high', CURRENT_DATE + 12,
    NOW() - INTERVAL '3 days', NOW()
  ),

  -- EduTech Solutions (stable)
  (
    'f0050001-0000-4000-8000-000000000020'::uuid,
    'a2000001-0000-4000-8000-000000000016'::uuid,
    'EduTech Solutions',
    'Course catalog search UX',
    'Filter and sort improvements for public catalog',
    'in_progress', 'medium', CURRENT_DATE + 10,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'
  ),
  (
    'f0050001-0000-4000-8000-000000000021'::uuid,
    'a2000001-0000-4000-8000-000000000015'::uuid,
    'EduTech Solutions',
    'Onboarding wireframes',
    'Student enrollment flow wireframes',
    'todo', 'high', CURRENT_DATE + 14,
    NOW() - INTERVAL '3 days', NOW()
  ),
  (
    'f0050001-0000-4000-8000-000000000022'::uuid,
    'a2000001-0000-4000-8000-000000000014'::uuid,
    'EduTech Solutions',
    'LMS SSO integration spec',
    'SAML integration doc pending client security review',
    'review', 'medium', CURRENT_DATE - 2,
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '8 days'
  )
) AS v(
  task_id, project_id, client_name, title, description,
  status, priority, due_date, created_at, updated_at
)
JOIN public.clients c ON c.name = v.client_name
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  due_date = EXCLUDED.due_date,
  updated_at = EXCLUDED.updated_at,
  category = EXCLUDED.category;

-- ── 2. Task comments (sentiment + activity signals) ────────────────────
INSERT INTO public.project_task_comments (
  task_id, activecollab_comment_id, comment_body, created_by_name, created_at, is_deleted
)
SELECT v.task_id, v.comment_id, v.body, v.author, v.created_at, false
FROM (VALUES
  ('a1000001-0000-4000-8000-000000000003'::uuid, 'seed-hub-comment-tc-01',
   'Homepage templates look great — excited to see product pages next week.', 'John Smith', NOW() - INTERVAL '2 days'),
  ('a1000002-0000-4000-8000-000000000003'::uuid, 'seed-hub-comment-hp-01',
   'We are concerned the HIPAA packet is late. Compliance team needs this before the audit window closes.', 'James Wilson', NOW() - INTERVAL '4 days'),
  ('a1000003-0000-4000-8000-000000000002'::uuid, 'seed-hub-comment-rp-01',
   'We are frustrated with the delay on the March campaign. Leadership is concerned about missing the launch window.', 'Sarah Johnson', NOW() - INTERVAL '3 days'),
  ('a1000003-0000-4000-8000-000000000001'::uuid, 'seed-hub-comment-rp-02',
   'Checkout A/B results are still pending — please share an update by Friday.', 'Marcus Lee', NOW() - INTERVAL '6 days'),
  ('a1000004-0000-4000-8000-000000000001'::uuid, 'seed-hub-comment-gm-01',
   'Publishing has completely stopped and leadership is very disappointed. We may need to escalate if this is not resolved this week.', 'Lisa Wong', NOW() - INTERVAL '2 days'),
  ('a1000004-0000-4000-8000-000000000002'::uuid, 'seed-hub-comment-gm-02',
   'Invoice for last month is still outstanding — please confirm when ads will go live.', 'Lisa Wong', NOW() - INTERVAL '5 days'),
  ('a1000004-0000-4000-8000-000000000003'::uuid, 'seed-hub-comment-gm-03',
   'Email nurture work has been blocked for weeks. This is unacceptable for our Q1 launch.', 'Robert Hayes', NOW() - INTERVAL '7 days'),
  ('f0050001-0000-4000-8000-000000000011'::uuid, 'seed-hub-comment-sx-01',
   'Deck narrative is strong — adding two customer proof points before investor meetings.', 'Mike Chen', NOW() - INTERVAL '1 day'),
  ('f0050001-0000-4000-8000-000000000020'::uuid, 'seed-hub-comment-et-01',
   'Catalog filters are much improved in the latest build. Onboarding wireframes are the next priority.', 'Amanda Brown', NOW() - INTERVAL '2 days'),
  ('f0050001-0000-4000-8000-000000000022'::uuid, 'seed-hub-comment-et-02',
   'Security review is taking longer than expected — not unhappy, but we need a revised timeline.', 'Carlos Mendez', NOW() - INTERVAL '5 days')
) AS v(task_id, comment_id, body, author, created_at)
WHERE EXISTS (SELECT 1 FROM public.project_tasks t WHERE t.id = v.task_id)
ON CONFLICT (activecollab_comment_id) DO UPDATE SET
  task_id = EXCLUDED.task_id,
  comment_body = EXCLUDED.comment_body,
  created_by_name = EXCLUDED.created_by_name,
  created_at = EXCLUDED.created_at,
  is_deleted = false;

-- ── 3. Meetings for clients missing recent engagement signals ────────────
INSERT INTO public.project_meetings (project_id, meeting_id, meeting_title, start_time, end_time)
SELECT v.project_id, v.meeting_id, v.title, v.start_time, v.end_time
FROM (VALUES
  ('a2000001-0000-4000-8000-000000000006'::uuid, 'seed-hub-meeting-sx-1', 'Series A deck review',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1 hour'),
  ('a2000001-0000-4000-8000-000000000016'::uuid, 'seed-hub-meeting-et-1', 'Catalog sprint planning',
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '45 minutes')
) AS v(project_id, meeting_id, title, start_time, end_time)
ON CONFLICT (project_id, meeting_id) DO UPDATE SET
  meeting_title = EXCLUDED.meeting_title,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;
