-- Demo recovery tasks for Retention Copilot client cards (tagged for recovery list)

INSERT INTO public.project_tasks (
  id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at
)
SELECT
  v.task_id, v.project_id, c.id, v.title, v.description, v.status, v.priority, v.due_date, NOW() - INTERVAL '2 days', NOW()
FROM (VALUES
  (
    'f0040001-0000-4000-8000-000000000001'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'Global Manufacturing',
    '[Recovery] Launch recovery sprint',
    'Daily standups and visible deliverable plan for 2 weeks

---
Source: client-retention-copilot',
    'todo', 'urgent', CURRENT_DATE + 1
  ),
  (
    'f0040001-0000-4000-8000-000000000002'::uuid,
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'Global Manufacturing',
    '[Recovery] Weekly executive status cadence',
    'Restore communication rhythm with Lisa Wong

---
Source: client-retention-copilot',
    'todo', 'high', CURRENT_DATE + 2
  ),
  (
    'f0040001-0000-4000-8000-000000000003'::uuid,
    'a2000001-0000-4000-8000-000000000010'::uuid,
    'RetailPlus Inc',
    '[Recovery] Schedule executive recovery call',
    'Align on revised marketplace delivery plan

---
Source: client-retention-copilot',
    'in_progress', 'urgent', CURRENT_DATE + 3
  ),
  (
    'f0040001-0000-4000-8000-000000000004'::uuid,
    'a2000001-0000-4000-8000-000000000010'::uuid,
    'RetailPlus Inc',
    '[Recovery] Unblock marketplace workstream',
    'Remove dependency blocking marketplace integration progress

---
Source: client-retention-copilot',
    'todo', 'high', CURRENT_DATE + 7
  ),
  (
    'f0040001-0000-4000-8000-000000000005'::uuid,
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'HealthcarePlus',
    '[Recovery] Book UI review session',
    'Align stakeholders on appointment booking screens

---
Source: client-retention-copilot',
    'todo', 'high', CURRENT_DATE + 5
  ),
  (
    'f0040001-0000-4000-8000-000000000006'::uuid,
    'a2000001-0000-4000-8000-000000000016'::uuid,
    'EduTech Solutions',
    '[Recovery] Publish 60-day EduTech roadmap',
    'Prioritize onboarding portal and catalog refresh

---
Source: client-retention-copilot',
    'todo', 'medium', CURRENT_DATE + 5
  )
) AS v(task_id, project_id, client_name, title, description, status, priority, due_date)
JOIN public.clients c ON c.name = v.client_name
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  due_date = EXCLUDED.due_date,
  updated_at = NOW();
