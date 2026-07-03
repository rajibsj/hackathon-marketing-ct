-- =====================================================
-- Hub client portfolio: remove fake demo clients,
-- enrich 6 real clients, seed contacts/deals/health snapshots
-- =====================================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ── 1. Remove fake portfolio clients (Acme / CloudFirst / DataDriven) ──
DO $$
DECLARE
  fake_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(id) INTO fake_ids
  FROM public.clients
  WHERE name IN ('Acme Tech Solutions', 'CloudFirst Inc', 'DataDriven Analytics')
     OR slug IN ('acme-tech', 'cloudfirst', 'datadriven-analytics');

  IF fake_ids IS NULL OR array_length(fake_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM public.weekly_client_summary WHERE client_id = ANY(fake_ids);
  DELETE FROM public.client_health_snapshots WHERE client_id = ANY(fake_ids);
  DELETE FROM public.activities WHERE client_id = ANY(fake_ids);
  DELETE FROM public.deals WHERE client_id = ANY(fake_ids);
  DELETE FROM public.contacts WHERE client_id = ANY(fake_ids);

  DELETE FROM public.project_task_comments
  WHERE task_id IN (
    SELECT id FROM public.project_tasks
    WHERE client_id = ANY(fake_ids)
       OR project_id IN (SELECT id FROM public.projects WHERE client_id = ANY(fake_ids))
  );

  DELETE FROM public.project_tasks
  WHERE client_id = ANY(fake_ids)
     OR project_id IN (SELECT id FROM public.projects WHERE client_id = ANY(fake_ids));

  DELETE FROM public.project_meetings
  WHERE project_id IN (SELECT id FROM public.projects WHERE client_id = ANY(fake_ids));

  DELETE FROM public.projects WHERE client_id = ANY(fake_ids);
  DELETE FROM public.clients WHERE id = ANY(fake_ids);
END $$;

-- Remove superseded Control Tower demo catalog (replaced by c2000001 series)
DELETE FROM public.control_tower_demo_projects
WHERE id::text LIKE 'c1000001-%';

-- ── 2. Enrich six hub client profiles ──
UPDATE public.clients SET
  slug = 'techcorp-solutions',
  company = 'TechCorp Inc.',
  email = 'contact@techcorp.com',
  phone = '+1-415-555-0101',
  website = 'https://www.techcorp-demo.com',
  contact_person = 'John Smith',
  address = '1200 Market Street, Suite 400',
  city = 'San Francisco',
  state = 'CA',
  country = 'USA',
  industry = 'Technology',
  status = 'active',
  satisfaction_score = 95,
  total_revenue = 75000,
  monthly_billing = 5500,
  company_revenue = 12000000,
  team_size = 85,
  founded_year = 2012,
  data_completeness_score = 92,
  source = 'import',
  notes = 'Flagship SaaS client. Strong engagement, on-time delivery, expanding scope in Q3.',
  updated_at = NOW()
WHERE name = 'TechCorp Solutions';

UPDATE public.clients SET
  slug = 'healthcareplus',
  company = 'HealthcarePlus',
  email = 'contact@healthcareplus.org',
  phone = '+1-617-555-0102',
  website = 'https://www.healthcareplus-demo.com',
  contact_person = 'Dr. James Wilson',
  address = '88 Medical Center Drive',
  city = 'Boston',
  state = 'MA',
  country = 'USA',
  industry = 'Healthcare',
  status = 'active',
  satisfaction_score = 82,
  total_revenue = 150000,
  monthly_billing = 9000,
  company_revenue = 45000000,
  team_size = 320,
  founded_year = 2008,
  data_completeness_score = 88,
  source = 'import',
  notes = 'Enterprise healthcare portal engagement. Compliance-heavy, steady communication cadence.',
  updated_at = NOW()
WHERE name = 'HealthcarePlus';

UPDATE public.clients SET
  slug = 'retailplus-inc',
  company = 'RetailPlus',
  email = 'hello@retailplus.com',
  phone = '+1-312-555-0103',
  website = 'https://www.retailplus-demo.com',
  contact_person = 'Sarah Johnson',
  address = '500 Michigan Avenue',
  city = 'Chicago',
  state = 'IL',
  country = 'USA',
  industry = 'Retail',
  status = 'active',
  satisfaction_score = 65,
  total_revenue = 120000,
  monthly_billing = 7500,
  company_revenue = 28000000,
  team_size = 210,
  founded_year = 2015,
  data_completeness_score = 84,
  source = 'import',
  notes = 'E-commerce modernization client. Delivery slipping on marketplace integration milestones.',
  updated_at = NOW()
WHERE name = 'RetailPlus Inc';

UPDATE public.clients SET
  slug = 'global-manufacturing',
  company = 'Global Manufacturing Corp',
  email = 'info@globalmanuf.com',
  phone = '+1-313-555-0104',
  website = 'https://www.globalmanuf-demo.com',
  contact_person = 'Lisa Wong',
  address = '2200 Industrial Parkway',
  city = 'Detroit',
  state = 'MI',
  country = 'USA',
  industry = 'Manufacturing',
  status = 'active',
  satisfaction_score = 42,
  total_revenue = 85000,
  monthly_billing = 7000,
  company_revenue = 95000000,
  team_size = 1200,
  founded_year = 1998,
  data_completeness_score = 79,
  source = 'import',
  notes = 'At-risk account. Low meeting cadence and missed campaign deadlines require recovery plan.',
  updated_at = NOW()
WHERE name = 'Global Manufacturing';

UPDATE public.clients SET
  slug = 'startupxyz',
  company = 'StartupXYZ',
  email = 'team@startupxyz.io',
  phone = '+1-512-555-0105',
  website = 'https://www.startupxyz-demo.com',
  contact_person = 'Mike Chen',
  address = '301 Congress Avenue, Floor 12',
  city = 'Austin',
  state = 'TX',
  country = 'USA',
  industry = 'Startup',
  status = 'active',
  satisfaction_score = 88,
  total_revenue = 38000,
  monthly_billing = 3200,
  company_revenue = 2500000,
  team_size = 18,
  founded_year = 2022,
  data_completeness_score = 86,
  source = 'import',
  notes = 'Early-stage startup. Brand work complete; preparing Series A fundraising collateral.',
  updated_at = NOW()
WHERE name = 'StartupXYZ';

UPDATE public.clients SET
  slug = 'edutech-solutions',
  company = 'EduTech Solutions',
  email = 'hello@edutech.edu',
  phone = '+1-206-555-0106',
  website = 'https://www.edutech-demo.com',
  contact_person = 'Amanda Brown',
  address = '1500 University Way',
  city = 'Seattle',
  state = 'WA',
  country = 'USA',
  industry = 'Education',
  status = 'active',
  satisfaction_score = 74,
  total_revenue = 95000,
  monthly_billing = 6200,
  company_revenue = 18000000,
  team_size = 140,
  founded_year = 2010,
  data_completeness_score = 81,
  source = 'import',
  notes = 'LMS platform client. LMS phase on hold; onboarding portal and catalog refresh in flight.',
  updated_at = NOW()
WHERE name = 'EduTech Solutions';

-- ── 3. Primary contacts (2 per hub client) ──
INSERT INTO public.contacts (id, client_id, first_name, last_name, email, phone, job_title, is_primary, created_at, updated_at)
SELECT v.id, c.id, v.first_name, v.last_name, v.email, v.phone, v.job_title, v.is_primary, NOW(), NOW()
FROM (VALUES
  ('f0010001-0000-4000-8000-000000000001'::uuid, 'TechCorp Solutions',      'John',   'Smith',   'john.smith@techcorp.com',       '+1-415-555-0111', 'VP Marketing',        true),
  ('f0010001-0000-4000-8000-000000000002'::uuid, 'TechCorp Solutions',      'Emily',  'Nguyen',  'emily.nguyen@techcorp.com',     '+1-415-555-0112', 'Product Marketing Mgr', false),
  ('f0010001-0000-4000-8000-000000000003'::uuid, 'HealthcarePlus',          'James',  'Wilson',  'j.wilson@healthcareplus.org',   '+1-617-555-0113', 'Chief Digital Officer', true),
  ('f0010001-0000-4000-8000-000000000004'::uuid, 'HealthcarePlus',          'Priya',  'Patel',   'priya.patel@healthcareplus.org','+1-617-555-0114', 'Patient Experience Lead', false),
  ('f0010001-0000-4000-8000-000000000005'::uuid, 'RetailPlus Inc',          'Sarah',  'Johnson', 'sarah.j@retailplus.com',        '+1-312-555-0115', 'Director of E-commerce', true),
  ('f0010001-0000-4000-8000-000000000006'::uuid, 'RetailPlus Inc',          'Marcus', 'Lee',     'marcus.lee@retailplus.com',     '+1-312-555-0116', 'Head of Loyalty',       false),
  ('f0010001-0000-4000-8000-000000000007'::uuid, 'Global Manufacturing',    'Lisa',   'Wong',    'lisa.wong@globalmanuf.com',      '+1-313-555-0117', 'Marketing Director',    true),
  ('f0010001-0000-4000-8000-000000000008'::uuid, 'Global Manufacturing',    'Robert', 'Hayes',   'robert.hayes@globalmanuf.com',  '+1-313-555-0118', 'Sales Operations',      false),
  ('f0010001-0000-4000-8000-000000000009'::uuid, 'StartupXYZ',              'Mike',   'Chen',    'mike@startupxyz.io',            '+1-512-555-0119', 'CEO',                   true),
  ('f0010001-0000-4000-8000-00000000000a'::uuid, 'StartupXYZ',              'Nina',   'Okafor',  'nina@startupxyz.io',            '+1-512-555-0120', 'Head of Growth',        false),
  ('f0010001-0000-4000-8000-00000000000b'::uuid, 'EduTech Solutions',       'Amanda', 'Brown',   'amanda.brown@edutech.edu',      '+1-206-555-0121', 'VP Product',            true),
  ('f0010001-0000-4000-8000-00000000000c'::uuid, 'EduTech Solutions',       'Carlos', 'Mendez',  'carlos.mendez@edutech.edu',    '+1-206-555-0122', 'Student Success Lead',  false)
) AS v(id, client_name, first_name, last_name, email, phone, job_title, is_primary)
JOIN public.clients c ON c.name = v.client_name
ON CONFLICT (id) DO UPDATE SET
  client_id = EXCLUDED.client_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  job_title = EXCLUDED.job_title,
  is_primary = EXCLUDED.is_primary,
  updated_at = NOW();

-- ── 4. Active deals per client ──
INSERT INTO public.deals (id, client_id, name, amount, stage, pipeline, probability, close_date, deal_type, created_at, updated_at)
SELECT v.id, c.id, v.name, v.amount, v.stage, v.pipeline, v.probability, v.close_date, v.deal_type, NOW(), NOW()
FROM (VALUES
  ('f0020001-0000-4000-8000-000000000001'::uuid, 'TechCorp Solutions',   '2026 Retainer Renewal',       66000::numeric, 'negotiation', 'services', 85::numeric, CURRENT_DATE + 45, 'renewal'),
  ('f0020001-0000-4000-8000-000000000002'::uuid, 'HealthcarePlus',       'Portal Phase 2 Expansion',   120000::numeric, 'proposal',    'services', 70::numeric, CURRENT_DATE + 60, 'expansion'),
  ('f0020001-0000-4000-8000-000000000003'::uuid, 'RetailPlus Inc',       'Marketplace Add-on',          48000::numeric, 'qualified',   'services', 55::numeric, CURRENT_DATE + 30, 'upsell'),
  ('f0020001-0000-4000-8000-000000000004'::uuid, 'Global Manufacturing', 'ABM Pilot Extension',         72000::numeric, 'at_risk',     'services', 35::numeric, CURRENT_DATE + 21, 'renewal'),
  ('f0020001-0000-4000-8000-000000000005'::uuid, 'StartupXYZ',           'Series A Marketing Package',  24000::numeric, 'closed_won',  'services', 100::numeric, CURRENT_DATE - 14, 'new_business'),
  ('f0020001-0000-4000-8000-000000000006'::uuid, 'EduTech Solutions',    'Onboarding Portal Sprint',    52000::numeric, 'discovery',   'services', 60::numeric, CURRENT_DATE + 40, 'expansion')
) AS v(id, client_name, name, amount, stage, pipeline, probability, close_date, deal_type)
JOIN public.clients c ON c.name = v.client_name
ON CONFLICT (id) DO UPDATE SET
  client_id = EXCLUDED.client_id,
  name = EXCLUDED.name,
  amount = EXCLUDED.amount,
  stage = EXCLUDED.stage,
  pipeline = EXCLUDED.pipeline,
  probability = EXCLUDED.probability,
  close_date = EXCLUDED.close_date,
  deal_type = EXCLUDED.deal_type,
  updated_at = NOW();

-- ── 5. Demo health snapshots for Retention Copilot portfolio ──
DELETE FROM public.client_health_snapshots
WHERE client_id IN (
  SELECT id FROM public.clients
  WHERE name IN (
    'TechCorp Solutions', 'HealthcarePlus', 'RetailPlus Inc',
    'Global Manufacturing', 'StartupXYZ', 'EduTech Solutions'
  )
);

INSERT INTO public.client_health_snapshots (
  id, client_id, health_score, churn_probability, churn_window_days, risk_band,
  summary, explanation, root_causes, recovery_plan, recommended_actions,
  heuristic_score, analyzed_at
)
SELECT
  v.snapshot_id,
  c.id,
  v.health_score,
  v.churn_probability,
  v.churn_window_days,
  v.risk_band,
  v.summary,
  v.explanation,
  v.root_causes::jsonb,
  v.recovery_plan::jsonb,
  v.recommended_actions::jsonb,
  v.health_score,
  NOW() - INTERVAL '2 hours'
FROM (VALUES
  (
    'f0030001-0000-4000-8000-000000000001'::uuid, 'TechCorp Solutions',
    88, 0.12, 90, 'healthy',
    'Strong delivery momentum with high client satisfaction.',
    'Tasks completing on schedule, recent positive meetings, and stable analytics engagement.',
    '[{"cause":"None critical","evidence":"95% satisfaction, on-time deliverables","severity":"low"}]',
    '[{"priority":1,"action":"Propose Q3 expansion roadmap","rationale":"Capitalize on trust while engagement is high","owner_hint":"Account Manager","due_in_days":14}]',
    '[{"type":"create_task","title":"Draft Q3 expansion proposal","description":"Outline upsell opportunities for SEO and product pages","priority":"medium"}]'
  ),
  (
    'f0030001-0000-4000-8000-000000000002'::uuid, 'HealthcarePlus',
    76, 0.28, 60, 'stable',
    'Solid progress with minor delivery friction on booking UI.',
    'Portal modules shipping well but review cycle on appointment UI is slowing velocity.',
    '[{"cause":"Review cycle delays","evidence":"Appointment booking UI in review for 4+ days","severity":"medium"}]',
    '[{"priority":1,"action":"Schedule design review working session","rationale":"Unblock UI approval before sprint ends","owner_hint":"PM","due_in_days":5}]',
    '[{"type":"create_task","title":"Book UI review session","description":"Align stakeholders on appointment booking screens","priority":"high"}]'
  ),
  (
    'f0030001-0000-4000-8000-000000000003'::uuid, 'RetailPlus Inc',
    58, 0.52, 45, 'watch',
    'Marketplace integration slipping — churn risk rising.',
    'Blocked whitepaper dependency and declining meeting cadence signal account stress.',
    '[{"cause":"Missed milestones","evidence":"Marketplace integration at 22% with overdue tasks","severity":"high"},{"cause":"Low executive engagement","evidence":"No leadership meeting in 21 days","severity":"medium"}]',
    '[{"priority":1,"action":"Executive check-in with Sarah Johnson","rationale":"Rebuild confidence and reset timeline","owner_hint":"Account Manager","due_in_days":3},{"priority":2,"action":"Unblock marketplace workstream","rationale":"Remove dependency blocking progress","owner_hint":"PM","due_in_days":7}]',
    '[{"type":"create_task","title":"Schedule executive recovery call","description":"Align on revised marketplace delivery plan","priority":"urgent"},{"type":"draft_email","subject":"RetailPlus delivery reset","body":"Proposed recovery plan for marketplace integration."}]'
  ),
  (
    'f0030001-0000-4000-8000-000000000004'::uuid, 'Global Manufacturing',
    34, 0.78, 30, 'critical',
    'Critical churn risk — campaign delays and poor engagement.',
    'Digital marketing campaign behind schedule, low meeting frequency, and negative task comment sentiment.',
    '[{"cause":"Campaign underperformance","evidence":"Q1 campaign at 15% progress past deadline","severity":"critical"},{"cause":"Stakeholder disengagement","evidence":"Last client meeting 18 days ago","severity":"high"}]',
    '[{"priority":1,"action":"Launch 14-day recovery sprint","rationale":"Stabilize account with visible wins","owner_hint":"PM","due_in_days":1},{"priority":2,"action":"Weekly executive status cadence","rationale":"Restore communication rhythm","owner_hint":"Account Manager","due_in_days":2}]',
    '[{"type":"create_task","title":"Launch recovery sprint","description":"Daily standups and visible deliverable plan for 2 weeks","priority":"urgent"},{"type":"slack_notify","message":"Global Manufacturing account flagged critical — recovery plan activated"}]'
  ),
  (
    'f0030001-0000-4000-8000-000000000005'::uuid, 'StartupXYZ',
    72, 0.22, 60, 'stable',
    'Brand work complete; fundraising collateral in progress.',
    'Strong satisfaction on brand identity. Pitch deck on track with minor review cycles.',
    '[{"cause":"Fundraising timeline pressure","evidence":"Pitch deck due in 14 days","severity":"medium"}]',
    '[{"priority":1,"action":"Finalize investor deck v2","rationale":"Meet Series A timeline","owner_hint":"Creative Lead","due_in_days":7}]',
    '[{"type":"create_task","title":"Investor deck design polish","description":"Finalize charts and narrative for Series A","priority":"high"}]'
  ),
  (
    'f0030001-0000-4000-8000-000000000006'::uuid, 'EduTech Solutions',
    61, 0.41, 45, 'watch',
    'LMS on hold but onboarding portal needs attention.',
    'Split focus across three projects with LMS paused; onboarding portal still in early planning.',
    '[{"cause":"Scope fragmentation","evidence":"3 concurrent projects with LMS on hold","severity":"medium"}]',
    '[{"priority":1,"action":"Consolidate near-term roadmap","rationale":"Focus client on highest-impact deliverables","owner_hint":"PM","due_in_days":5}]',
    '[{"type":"create_task","title":"Publish 60-day EduTech roadmap","description":"Prioritize onboarding portal and catalog refresh","priority":"medium"}]'
  )
) AS v(
  snapshot_id, client_name, health_score, churn_probability, churn_window_days, risk_band,
  summary, explanation, root_causes, recovery_plan, recommended_actions
)
JOIN public.clients c ON c.name = v.client_name;

-- Sync denormalized client health fields
UPDATE public.clients c SET
  health_score = s.health_score,
  churn_risk_band = s.risk_band,
  last_health_analysis_at = s.analyzed_at
FROM public.client_health_snapshots s
WHERE s.client_id = c.id
  AND s.id IN (
    'f0030001-0000-4000-8000-000000000001',
    'f0030001-0000-4000-8000-000000000002',
    'f0030001-0000-4000-8000-000000000003',
    'f0030001-0000-4000-8000-000000000004',
    'f0030001-0000-4000-8000-000000000005',
    'f0030001-0000-4000-8000-000000000006'
  );

-- ── 6. Light activity signals for StartupXYZ & EduTech ──
INSERT INTO public.project_tasks (id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at)
VALUES
  ('a1000003-0000-4000-8000-000000000001'::uuid, 'a2000001-0000-4000-8000-000000000006'::uuid,
   (SELECT id FROM public.clients WHERE name = 'StartupXYZ'),
   'Pitch deck narrative outline', 'CEO story arc and traction slides', 'in_progress', 'urgent', CURRENT_DATE + 7, NOW() - INTERVAL '5 days', NOW()),
  ('a1000004-0000-4000-8000-000000000001'::uuid, 'a2000001-0000-4000-8000-000000000015'::uuid,
   (SELECT id FROM public.clients WHERE name = 'EduTech Solutions'),
   'Onboarding wireframes', 'Student enrollment flow wireframes', 'todo', 'high', CURRENT_DATE + 14, NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;
