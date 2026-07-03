-- =====================================================
-- 15 Control Tower projects for 6 hub clients
-- 3 clients × 2 projects = 6
-- 3 clients × 3 projects = 9
-- Total: 15 (all visible on /projects as CT imports)
-- =====================================================

-- Remove orphan CT imports not tied to hub clients (e.g. manual demo import)
DELETE FROM public.projects
WHERE client_id IS NULL
  AND control_tower_project_id IS NOT NULL;

-- Demote non-hub demo projects from /projects listing (ActiveCollab-only slugs)
UPDATE public.projects p
SET
  activecollab_id = NULL,
  activecollab_project_id = NULL,
  activecollab_sync_at = NULL
WHERE p.client_id IS NULL
   OR p.client_id NOT IN (
     SELECT id FROM public.clients
     WHERE name IN (
       'TechCorp Solutions',
       'HealthcarePlus',
       'StartupXYZ',
       'RetailPlus Inc',
       'Global Manufacturing',
       'EduTech Solutions'
     )
   );

-- Upsert catalog entries for Import from Control Tower search
INSERT INTO public.control_tower_demo_projects (
  id, name, description, status, progress, priority, manager, team, budget, actual_cost, start_date, end_date
) VALUES
('c2000001-0000-4000-8000-000000000001', 'Website Redesign', 'Corporate website overhaul with CMS migration and Core Web Vitals optimization.', 'active', 65, 'high', 'Priya Sharma', 'Design Pod', 75000, 42000, CURRENT_DATE - 45, CURRENT_DATE + 30),
('c2000001-0000-4000-8000-000000000002', 'SEO Content Program', 'Monthly SEO blog production and keyword cluster strategy for TechCorp.', 'active', 40, 'medium', 'Maria Chen', 'SEO Pod', 42000, 15000, CURRENT_DATE - 20, CURRENT_DATE + 90),
('c2000001-0000-4000-8000-000000000003', 'Patient Portal System', 'HIPAA-aware portal for appointments, records, and secure messaging.', 'active', 80, 'high', 'James Wilson', 'Healthcare Pod', 150000, 98000, CURRENT_DATE - 90, CURRENT_DATE + 45),
('c2000001-0000-4000-8000-000000000004', 'Telehealth Mobile App', 'iOS/Android telehealth companion app with video visits and prescriptions.', 'active', 35, 'high', 'James Wilson', 'Mobile Squad', 110000, 28000, CURRENT_DATE - 14, CURRENT_DATE + 120),
('c2000001-0000-4000-8000-000000000005', 'Brand Identity Development', 'Logo system, color palette, typography, and brand guidelines for StartupXYZ.', 'completed', 100, 'medium', 'Anik Rahman', 'Brand Studio', 25000, 24500, CURRENT_DATE - 120, CURRENT_DATE - 30),
('c2000001-0000-4000-8000-000000000006', 'Investor Pitch Deck', 'Series A pitch deck, one-pager, and data room collateral.', 'in_progress', 70, 'urgent', 'David Park', 'Strategy', 18000, 12000, CURRENT_DATE - 21, CURRENT_DATE + 14),
('c2000001-0000-4000-8000-000000000007', 'E-commerce Platform', 'Headless commerce build with mobile checkout and inventory sync.', 'active', 40, 'medium', 'Sarah Johnson', 'Commerce Squad', 120000, 38000, CURRENT_DATE - 30, CURRENT_DATE + 60),
('c2000001-0000-4000-8000-000000000008', 'Loyalty Rewards Launch', 'Points-based loyalty program with email triggers and CRM integration.', 'planning', 10, 'high', 'Sarah Johnson', 'Growth Team', 55000, 4000, CURRENT_DATE - 7, CURRENT_DATE + 75),
('c2000001-0000-4000-8000-000000000009', 'Marketplace Integration', 'Third-party marketplace listings sync for Amazon and Walmart.', 'active', 22, 'medium', 'Sarah Johnson', 'Integrations', 68000, 14000, CURRENT_DATE - 10, CURRENT_DATE + 90),
('c2000001-0000-4000-8000-000000000010', 'Digital Marketing Campaign', 'Multi-channel Q1 launch across paid search, LinkedIn, and nurture email.', 'planning', 15, 'high', 'Lisa Wong', 'Growth Team', 85000, 12000, CURRENT_DATE - 14, CURRENT_DATE + 75),
('c2000001-0000-4000-8000-000000000011', 'Trade Show Lead Gen', 'Pre-show outreach, booth assets, and post-event nurture for manufacturing expo.', 'active', 48, 'medium', 'Lisa Wong', 'Events', 45000, 21000, CURRENT_DATE - 25, CURRENT_DATE + 45),
('c2000001-0000-4000-8000-000000000012', 'ABM Enterprise Pilot', 'Account-based marketing pilot targeting top 50 enterprise accounts.', 'active', 30, 'high', 'Lisa Wong', 'ABM Squad', 72000, 18000, CURRENT_DATE - 18, CURRENT_DATE + 60),
('c2000001-0000-4000-8000-000000000013', 'Learning Management System', 'Custom LMS for course delivery, quizzes, and progress tracking.', 'on_hold', 25, 'medium', 'Amanda Brown', 'EdTech Pod', 95000, 22000, CURRENT_DATE - 60, CURRENT_DATE + 120),
('c2000001-0000-4000-8000-000000000014', 'Student Onboarding Portal', 'Self-serve enrollment, payment, and orientation workflows for new students.', 'planning', 8, 'high', 'Amanda Brown', 'Product', 64000, 3000, CURRENT_DATE - 5, CURRENT_DATE + 90),
('c2000001-0000-4000-8000-000000000015', 'Course Catalog Refresh', 'UX refresh and search improvements for public course catalog.', 'active', 52, 'medium', 'Amanda Brown', 'Content', 38000, 19000, CURRENT_DATE - 35, CURRENT_DATE + 55)
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

-- Clear slug collisions from legacy demo rows before canonical upsert
UPDATE public.projects
SET slug = slug || '-legacy-' || LEFT(id::text, 8)
WHERE slug IN (
  'tc-website-redesign', 'tc-seo-content-program',
  'hp-patient-portal', 'hp-telehealth-mobile',
  'su-brand-identity', 'su-investor-pitch-deck',
  'rp-ecommerce-platform', 'rp-loyalty-rewards', 'rp-marketplace-integration',
  'gm-digital-marketing', 'gm-trade-show-leads', 'gm-abm-pilot',
  'et-lms-platform', 'et-student-onboarding', 'et-course-catalog'
)
AND id NOT IN (
  'a2000001-0000-4000-8000-000000000001'::uuid,
  'a2000001-0000-4000-8000-000000000002'::uuid,
  'a2000001-0000-4000-8000-000000000003'::uuid,
  'a2000001-0000-4000-8000-000000000004'::uuid,
  'a2000001-0000-4000-8000-000000000005'::uuid,
  'a2000001-0000-4000-8000-000000000006'::uuid,
  'a2000001-0000-4000-8000-000000000008'::uuid,
  'a2000001-0000-4000-8000-000000000009'::uuid,
  'a2000001-0000-4000-8000-000000000010'::uuid,
  'a2000001-0000-4000-8000-000000000011'::uuid,
  'a2000001-0000-4000-8000-000000000012'::uuid,
  'a2000001-0000-4000-8000-000000000013'::uuid,
  'a2000001-0000-4000-8000-000000000014'::uuid,
  'a2000001-0000-4000-8000-000000000015'::uuid,
  'a2000001-0000-4000-8000-000000000016'::uuid
);

-- Seed / update local projects linked to clients
WITH seed AS (
  SELECT * FROM (VALUES
    ('c2000001-0000-4000-8000-000000000001'::uuid, 'a2000001-0000-4000-8000-000000000001'::uuid, 'TechCorp Solutions',      'Website Redesign',              'tc-website-redesign',         'Complete overhaul of corporate website with modern design and functionality', 'in_progress', 'high',   75000::numeric, 65, 45, 30),
    ('c2000001-0000-4000-8000-000000000002'::uuid, 'a2000001-0000-4000-8000-000000000002'::uuid, 'TechCorp Solutions',      'SEO Content Program',           'tc-seo-content-program',      'Monthly SEO blog production and keyword cluster strategy',                    'in_progress', 'medium', 42000::numeric, 40, 20, 90),
    ('c2000001-0000-4000-8000-000000000003'::uuid, 'a2000001-0000-4000-8000-000000000003'::uuid, 'HealthcarePlus',          'Patient Portal System',         'hp-patient-portal',           'Patient portal development for appointment booking and medical records',    'in_progress', 'high',   150000::numeric, 80, 90, 45),
    ('c2000001-0000-4000-8000-000000000004'::uuid, 'a2000001-0000-4000-8000-000000000004'::uuid, 'HealthcarePlus',          'Telehealth Mobile App',         'hp-telehealth-mobile',        'Mobile telehealth app with video visits and prescription refill flows',       'in_progress', 'high',   110000::numeric, 35, 14, 120),
    ('c2000001-0000-4000-8000-000000000005'::uuid, 'a2000001-0000-4000-8000-000000000005'::uuid, 'StartupXYZ',              'Brand Identity Development',    'su-brand-identity',           'Creating comprehensive brand identity including logo, colors, and guidelines',  'completed',   'medium', 25000::numeric, 100, 120, -30),
    ('c2000001-0000-4000-8000-000000000006'::uuid, 'a2000001-0000-4000-8000-000000000006'::uuid, 'StartupXYZ',              'Investor Pitch Deck',           'su-investor-pitch-deck',      'Series A pitch deck, financial model visuals, and investor one-pager',        'in_progress', 'urgent', 18000::numeric, 70, 21, 14),
    ('c2000001-0000-4000-8000-000000000007'::uuid, 'a2000001-0000-4000-8000-000000000008'::uuid, 'RetailPlus Inc',          'E-commerce Platform',           'rp-ecommerce-platform',       'Development of new e-commerce platform with mobile optimization',             'in_progress', 'medium', 120000::numeric, 40, 30, 60),
    ('c2000001-0000-4000-8000-000000000008'::uuid, 'a2000001-0000-4000-8000-000000000009'::uuid, 'RetailPlus Inc',          'Loyalty Rewards Launch',        'rp-loyalty-rewards',          'Points-based loyalty program with CRM and email automation',                  'planning',    'high',   55000::numeric, 10, 7, 75),
    ('c2000001-0000-4000-8000-000000000009'::uuid, 'a2000001-0000-4000-8000-000000000010'::uuid, 'RetailPlus Inc',          'Marketplace Integration',       'rp-marketplace-integration',  'Amazon and Walmart marketplace listing sync and order routing',               'in_progress', 'medium', 68000::numeric, 22, 10, 90),
    ('c2000001-0000-4000-8000-000000000010'::uuid, 'a2000001-0000-4000-8000-000000000011'::uuid, 'Global Manufacturing',    'Digital Marketing Campaign',    'gm-digital-marketing',        'Multi-channel digital marketing campaign for Q1 product launch',            'planning',    'high',   85000::numeric, 15, 14, 75),
    ('c2000001-0000-4000-8000-000000000011'::uuid, 'a2000001-0000-4000-8000-000000000012'::uuid, 'Global Manufacturing',    'Trade Show Lead Gen',           'gm-trade-show-leads',         'Manufacturing expo booth creative, lead capture, and nurture sequences',      'in_progress', 'medium', 45000::numeric, 48, 25, 45),
    ('c2000001-0000-4000-8000-000000000012'::uuid, 'a2000001-0000-4000-8000-000000000013'::uuid, 'Global Manufacturing',    'ABM Enterprise Pilot',          'gm-abm-pilot',                'Account-based marketing pilot for top 50 enterprise manufacturing accounts',  'in_progress', 'high',   72000::numeric, 30, 18, 60),
    ('c2000001-0000-4000-8000-000000000013'::uuid, 'a2000001-0000-4000-8000-000000000014'::uuid, 'EduTech Solutions',       'Learning Management System',    'et-lms-platform',             'Custom LMS development for online course delivery',                           'on_hold',     'medium', 95000::numeric, 25, 60, 120),
    ('c2000001-0000-4000-8000-000000000014'::uuid, 'a2000001-0000-4000-8000-000000000015'::uuid, 'EduTech Solutions',       'Student Onboarding Portal',     'et-student-onboarding',       'Enrollment, payment, and orientation workflows for new students',             'planning',    'high',   64000::numeric, 8, 5, 90),
    ('c2000001-0000-4000-8000-000000000015'::uuid, 'a2000001-0000-4000-8000-000000000016'::uuid, 'EduTech Solutions',       'Course Catalog Refresh',        'et-course-catalog',           'Public course catalog UX refresh with improved search and filters',           'in_progress', 'medium', 38000::numeric, 52, 35, 55)
  ) AS v(
    ct_id, project_id, client_name, project_name, slug, description,
    status, priority, budget, progress, start_days_ago, end_days_ahead
  )
),
resolved AS (
  SELECT
    s.*,
    c.id AS client_id
  FROM seed s
  JOIN public.clients c ON c.name = s.client_name
)
INSERT INTO public.projects (
  id,
  client_id,
  name,
  slug,
  description,
  status,
  priority,
  budget,
  progress,
  start_date,
  end_date,
  deadline,
  control_tower_project_id,
  control_tower_last_synced_at,
  external_project_id,
  activecollab_id,
  activecollab_project_id,
  activecollab_sync_at,
  created_at,
  updated_at
)
SELECT
  r.project_id,
  r.client_id,
  r.project_name,
  r.slug,
  r.description,
  r.status,
  r.priority,
  r.budget,
  r.progress,
  (CURRENT_DATE - r.start_days_ago),
  (CURRENT_DATE + r.end_days_ahead),
  (CURRENT_DATE + r.end_days_ahead),
  r.ct_id,
  NOW(),
  r.ct_id,
  NULL,
  NULL,
  NULL,
  NOW() - (r.start_days_ago || ' days')::interval,
  NOW()
FROM resolved r
ON CONFLICT (id) DO UPDATE SET
  client_id = EXCLUDED.client_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  budget = EXCLUDED.budget,
  progress = EXCLUDED.progress,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  deadline = EXCLUDED.deadline,
  control_tower_project_id = EXCLUDED.control_tower_project_id,
  control_tower_last_synced_at = EXCLUDED.control_tower_last_synced_at,
  external_project_id = EXCLUDED.external_project_id,
  activecollab_id = NULL,
  activecollab_project_id = NULL,
  activecollab_sync_at = NULL,
  updated_at = NOW();

-- Align legacy rows: re-point tasks and meetings, then remove duplicate hub projects
UPDATE public.project_tasks t
SET project_id = 'a2000001-0000-4000-8000-000000000001'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE t.project_id = old_p.id
  AND c.name = 'TechCorp Solutions'
  AND old_p.name = 'Website Redesign'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000001'::uuid;

UPDATE public.project_tasks t
SET project_id = 'a2000001-0000-4000-8000-000000000003'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE t.project_id = old_p.id
  AND c.name = 'HealthcarePlus'
  AND old_p.name = 'Patient Portal System'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000003'::uuid;

UPDATE public.project_tasks t
SET project_id = 'a2000001-0000-4000-8000-000000000005'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE t.project_id = old_p.id
  AND c.name = 'StartupXYZ'
  AND old_p.name = 'Brand Identity Development'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000005'::uuid;

UPDATE public.project_tasks t
SET project_id = 'a2000001-0000-4000-8000-000000000008'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE t.project_id = old_p.id
  AND c.name = 'RetailPlus Inc'
  AND old_p.name = 'E-commerce Platform'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000008'::uuid;

UPDATE public.project_tasks t
SET project_id = 'a2000001-0000-4000-8000-000000000011'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE t.project_id = old_p.id
  AND c.name = 'Global Manufacturing'
  AND old_p.name = 'Digital Marketing Campaign'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000011'::uuid;

UPDATE public.project_tasks t
SET project_id = 'a2000001-0000-4000-8000-000000000014'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE t.project_id = old_p.id
  AND c.name = 'EduTech Solutions'
  AND old_p.name = 'Learning Management System'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000014'::uuid;

-- Re-point meetings tied to legacy project ids
UPDATE public.project_meetings m
SET project_id = 'a2000001-0000-4000-8000-000000000001'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE m.project_id = old_p.id
  AND c.name = 'TechCorp Solutions'
  AND old_p.name = 'Website Redesign'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000001'::uuid;

UPDATE public.project_meetings m
SET project_id = 'a2000001-0000-4000-8000-000000000003'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE m.project_id = old_p.id
  AND c.name = 'HealthcarePlus'
  AND old_p.name = 'Patient Portal System'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000003'::uuid;

UPDATE public.project_meetings m
SET project_id = 'a2000001-0000-4000-8000-000000000008'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE m.project_id = old_p.id
  AND c.name = 'RetailPlus Inc'
  AND old_p.name = 'E-commerce Platform'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000008'::uuid;

UPDATE public.project_meetings m
SET project_id = 'a2000001-0000-4000-8000-000000000011'::uuid
FROM public.projects old_p
JOIN public.clients c ON c.id = old_p.client_id
WHERE m.project_id = old_p.id
  AND c.name = 'Global Manufacturing'
  AND old_p.name = 'Digital Marketing Campaign'
  AND old_p.id <> 'a2000001-0000-4000-8000-000000000011'::uuid;

-- Delete duplicate legacy hub projects (canonical ids retained)
DELETE FROM public.projects old_p
USING public.clients c
WHERE old_p.client_id = c.id
  AND (
    (c.name = 'TechCorp Solutions' AND old_p.name IN ('Website Redesign', 'SEO Content Program'))
    OR (c.name = 'HealthcarePlus' AND old_p.name IN ('Patient Portal System', 'Telehealth Mobile App'))
    OR (c.name = 'StartupXYZ' AND old_p.name IN ('Brand Identity Development', 'Investor Pitch Deck'))
    OR (c.name = 'RetailPlus Inc' AND old_p.name IN ('E-commerce Platform', 'Loyalty Rewards Launch', 'Marketplace Integration'))
    OR (c.name = 'Global Manufacturing' AND old_p.name IN ('Digital Marketing Campaign', 'Trade Show Lead Gen', 'ABM Enterprise Pilot'))
    OR (c.name = 'EduTech Solutions' AND old_p.name IN ('Learning Management System', 'Student Onboarding Portal', 'Course Catalog Refresh'))
  )
  AND old_p.id NOT IN (
    'a2000001-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000004'::uuid,
    'a2000001-0000-4000-8000-000000000005'::uuid,
    'a2000001-0000-4000-8000-000000000006'::uuid,
    'a2000001-0000-4000-8000-000000000008'::uuid,
    'a2000001-0000-4000-8000-000000000009'::uuid,
    'a2000001-0000-4000-8000-000000000010'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'a2000001-0000-4000-8000-000000000012'::uuid,
    'a2000001-0000-4000-8000-000000000013'::uuid,
    'a2000001-0000-4000-8000-000000000014'::uuid,
    'a2000001-0000-4000-8000-000000000015'::uuid,
    'a2000001-0000-4000-8000-000000000016'::uuid
  );

-- Clear old CT ids from previous seed (c1000001 series) on replaced rows
UPDATE public.projects
SET
  control_tower_project_id = NULL,
  control_tower_last_synced_at = NULL,
  external_project_id = NULL
WHERE control_tower_project_id::text LIKE 'c1000001-%'
  AND id NOT IN (
    'a2000001-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000004'::uuid,
    'a2000001-0000-4000-8000-000000000005'::uuid,
    'a2000001-0000-4000-8000-000000000006'::uuid,
    'a2000001-0000-4000-8000-000000000008'::uuid,
    'a2000001-0000-4000-8000-000000000009'::uuid,
    'a2000001-0000-4000-8000-000000000010'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'a2000001-0000-4000-8000-000000000012'::uuid,
    'a2000001-0000-4000-8000-000000000013'::uuid,
    'a2000001-0000-4000-8000-000000000014'::uuid,
    'a2000001-0000-4000-8000-000000000015'::uuid,
    'a2000001-0000-4000-8000-000000000016'::uuid
  );
