-- Seed meeting transcript concerns for EduTech Solutions — Student Onboarding Portal
-- Visible at /projects/student-onboarding-portal/details → Meetings tab
-- Powers retention copilot project-wise concern keywords after Analyze Portfolio

UPDATE public.projects
SET
  retention_meeting_transcripts = '[
    {
      "id": "seed-meeting-et-onboarding-001",
      "title": "Bi-weekly client check-in",
      "meeting_date": "2026-02-18",
      "transcript_link": "https://docs.google.com/document/d/demo-student-onboarding-transcript-feb18",
      "transcript_text": "Amanda (EduTech): We are disappointed with how slowly the enrollment flow is moving. Parents are frustrated because orientation emails went out late again. David (PM): I understand — we missed the deadline for the payment integration demo. Amanda: The SSO handoff is overdue by two weeks and our registrar team is escalating internally. If we do not see progress before board review, legal may get involved — they asked whether we need to sue for breach if milestones slip again.",
      "generated_text": "Bi-weekly client check-in (Feb 18, 2026)\nAmanda (EduTech): We are disappointed with how slowly the enrollment flow is moving. Parents are frustrated because orientation emails went out late again. David (PM): I understand — we missed the deadline for the payment integration demo. Amanda: The SSO handoff is overdue by two weeks and our registrar team is escalating internally.\nClient concern keywords detected:\n- Keyword \"disappointed\" in meeting: \"…We are disappointed with how slowly the enrollment flow is moving…\"\n- Keyword \"frustrated\" in meeting: \"…Parents are frustrated because orientation emails went out late…\"\n- Keyword \"missed deadline\" in meeting: \"…we missed the deadline for the payment integration demo…\"\n- Keyword \"overdue\" in meeting: \"…The SSO handoff is overdue by two weeks…\"\n- Keyword \"sue\" in meeting: \"…whether we need to sue for breach if milestones slip again.\"",
      "concern_keywords": ["disappointed", "frustrated", "missed deadline", "overdue", "escalate", "sue"],
      "concern_flags": [
        "Keyword \"disappointed\" in meeting: \"…We are disappointed with how slowly the enrollment flow is moving…\"",
        "Keyword \"frustrated\" in meeting: \"…Parents are frustrated because orientation emails went out late…\"",
        "Keyword \"missed deadline\" in meeting: \"…we missed the deadline for the payment integration demo…\"",
        "Keyword \"overdue\" in meeting: \"…The SSO handoff is overdue by two weeks…\"",
        "Keyword \"sue\" in meeting: \"…whether we need to sue for breach if milestones slip again.\""
      ],
      "concern_hits": [
        {"keyword": "disappointed", "excerpt": "We are disappointed with how slowly the enrollment flow is moving."},
        {"keyword": "frustrated", "excerpt": "Parents are frustrated because orientation emails went out late again."},
        {"keyword": "missed deadline", "excerpt": "we missed the deadline for the payment integration demo."},
        {"keyword": "overdue", "excerpt": "The SSO handoff is overdue by two weeks and our registrar team is escalating internally."},
        {"keyword": "sue", "excerpt": "they asked whether we need to sue for breach if milestones slip again."}
      ],
      "has_client_concerns": true,
      "keyword_scan_at": "2026-02-18T15:30:00.000Z"
    },
    {
      "id": "seed-meeting-et-onboarding-002",
      "title": "Orientation workflow review",
      "meeting_date": "2026-03-05",
      "transcript_link": "https://docs.google.com/document/d/demo-student-onboarding-transcript-mar05",
      "transcript_text": "Amanda: The welcome sequence still has issues — students complain the portal feels broken. We had another missed deadline on document upload. I am concerned this will hurt our fall enrollment numbers.",
      "generated_text": "Orientation workflow review (Mar 5, 2026)\nAmanda: The welcome sequence still has issues — students complain the portal feels broken. We had another missed deadline on document upload. I am concerned this will hurt our fall enrollment numbers.\nClient concern keywords detected:\n- Keyword \"complain\" in meeting: \"…students complain the portal feels broken…\"\n- Keyword \"missed deadline\" in meeting: \"…another missed deadline on document upload…\"\n- Keyword \"concerned\" in meeting: \"…I am concerned this will hurt our fall enrollment numbers.\"",
      "concern_keywords": ["complain", "missed deadline", "concerned", "issue"],
      "concern_flags": [
        "Keyword \"complain\" in meeting: \"…students complain the portal feels broken…\"",
        "Keyword \"missed deadline\" in meeting: \"…another missed deadline on document upload…\"",
        "Keyword \"concerned\" in meeting: \"…I am concerned this will hurt our fall enrollment numbers.\""
      ],
      "concern_hits": [
        {"keyword": "complain", "excerpt": "students complain the portal feels broken."},
        {"keyword": "missed deadline", "excerpt": "We had another missed deadline on document upload."},
        {"keyword": "concerned", "excerpt": "I am concerned this will hurt our fall enrollment numbers."}
      ],
      "has_client_concerns": true,
      "keyword_scan_at": "2026-03-05T11:00:00.000Z"
    }
  ]'::jsonb,
  retention_meeting_signal_text = 'Project meeting transcripts for retention analysis:
2 meeting(s) flagged with client concern keywords.

Meeting 1: Bi-weekly client check-in
Date: Feb 18, 2026
Status: client concerns detected
Concern keywords: disappointed, frustrated, missed deadline, overdue, escalate, sue
Link: https://docs.google.com/document/d/demo-student-onboarding-transcript-feb18
Bi-weekly client check-in (Feb 18, 2026)
Amanda (EduTech): We are disappointed with how slowly the enrollment flow is moving. Parents are frustrated because orientation emails went out late again. David (PM): I understand — we missed the deadline for the payment integration demo. Amanda: The SSO handoff is overdue by two weeks and our registrar team is escalating internally.

Meeting 2: Orientation workflow review
Date: Mar 5, 2026
Status: client concerns detected
Concern keywords: complain, missed deadline, concerned, issue
Link: https://docs.google.com/document/d/demo-student-onboarding-transcript-mar05
Orientation workflow review (Mar 5, 2026)
Amanda: The welcome sequence still has issues — students complain the portal feels broken. We had another missed deadline on document upload. I am concerned this will hurt our fall enrollment numbers.',
  zoom_transcript_link = 'https://docs.google.com/document/d/demo-student-onboarding-transcript-feb18',
  updated_at = NOW()
WHERE id = 'a2000001-0000-4000-8000-000000000015'::uuid
   OR (slug = 'et-student-onboarding' AND name = 'Student Onboarding Portal');

-- Optional: overdue tasks on same project so project-wise concerns show delivery + meeting signals
INSERT INTO public.project_tasks (
  id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, category
)
SELECT
  'f0050001-0000-4000-8000-000000000015'::uuid,
  p.id,
  p.client_id,
  'SSO enrollment handoff',
  'Single sign-on integration for student enrollment — client escalated in Feb check-in',
  'in_progress',
  'urgent',
  CURRENT_DATE - 14,
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '16 days',
  'clients'
FROM public.projects p
WHERE p.id = 'a2000001-0000-4000-8000-000000000015'::uuid
   OR (p.slug = 'et-student-onboarding' AND p.name = 'Student Onboarding Portal')
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  due_date = EXCLUDED.due_date,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.project_tasks (
  id, project_id, client_id, title, description, status, priority, due_date, created_at, updated_at, category
)
SELECT
  'f0050001-0000-4000-8000-000000000016'::uuid,
  p.id,
  p.client_id,
  'Payment integration demo',
  'Demo environment for tuition payment flow — missed original deadline',
  'todo',
  'high',
  CURRENT_DATE - 7,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '18 days',
  'clients'
FROM public.projects p
WHERE p.id = 'a2000001-0000-4000-8000-000000000015'::uuid
   OR (p.slug = 'et-student-onboarding' AND p.name = 'Student Onboarding Portal')
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  client_id = EXCLUDED.client_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  due_date = EXCLUDED.due_date,
  updated_at = EXCLUDED.updated_at;
