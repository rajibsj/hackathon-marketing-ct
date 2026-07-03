-- =====================================================
-- Client communication signals for Retention Copilot
-- Zoom transcripts, Slack, Teams, and email threads
-- =====================================================

-- Allow modern communication channel types
ALTER TABLE public.client_communications
  DROP CONSTRAINT IF EXISTS client_communications_type_check;

ALTER TABLE public.client_communications
  ADD CONSTRAINT client_communications_type_check
  CHECK (type IN ('email', 'call', 'meeting', 'note', 'zoom', 'slack', 'teams'));

-- Enrich seeded meetings with Zoom transcript excerpts (local fallback when Control Tower is offline)
UPDATE public.project_meetings m
SET
  meeting_type = 'zoom',
  meeting_description = v.transcript,
  meeting_data = jsonb_build_object('source', 'seed', 'channel', 'zoom', 'transcript_summary', v.transcript)
FROM (VALUES
  ('demo-tc-meeting-1',
   'Client praised homepage launch velocity. Asked for weekly status updates on product pages. Tone: positive, collaborative.'),
  ('demo-hp-meeting-1',
   'Client raised HIPAA documentation delay as a concern. PM committed to revised delivery date. Tone: cautious but engaged.'),
  ('demo-rp-meeting-1',
   'Client frustrated about March campaign slip. Mentioned leadership review next week if launch misses. Tone: concerned.'),
  ('demo-gm-meeting-1',
   'Client said publishing has stopped and leadership is disappointed. Escalation to VP discussed. Tone: unhappy.')
) AS v(meeting_id, transcript)
WHERE m.meeting_id = v.meeting_id;

-- Seed multi-channel client communications
INSERT INTO public.client_communications (
  id, client_id, project_id, type, subject, content, direction, created_by, created_at
)
SELECT
  v.comm_id,
  c.id,
  v.project_id,
  v.comm_type,
  v.subject,
  v.content,
  v.direction,
  '500b4a7f-4c4a-429e-a307-0601568c8525'::uuid,
  v.created_at
FROM (VALUES
  -- TechCorp: healthy engagement across channels
  (
    'c1000001-0000-4000-8000-000000000001'::uuid,
    'TechCorp Solutions',
    'a2000001-0000-4000-8000-000000000001'::uuid,
    'slack', '#techcorp-delivery',
    'Homepage looks great in staging — ready to push to prod Friday.',
    'inbound', NOW() - INTERVAL '3 days'
  ),
  (
    'c1000001-0000-4000-8000-000000000002'::uuid,
    'TechCorp Solutions',
    'a2000001-0000-4000-8000-000000000001'::uuid,
    'zoom', 'Bi-weekly check-in transcript',
    'Team aligned on Q2 roadmap. Client happy with velocity and communication cadence.',
    'inbound', NOW() - INTERVAL '5 days'
  ),

  -- HealthcarePlus: mixed signals
  (
    'c1000002-0000-4000-8000-000000000001'::uuid,
    'HealthcarePlus',
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'teams', 'HIPAA audit thread',
    'Compliance lead is concerned about documentation timeline slipping into next sprint.',
    'inbound', NOW() - INTERVAL '4 days'
  ),
  (
    'c1000002-0000-4000-8000-000000000002'::uuid,
    'HealthcarePlus',
    'a2000001-0000-4000-8000-000000000003'::uuid,
    'email', 'Re: portal go-live date',
    'We need a firm date for authentication module — board review is in two weeks.',
    'inbound', NOW() - INTERVAL '6 days'
  ),

  -- RetailPlus: frustration in Slack
  (
    'c1000003-0000-4000-8000-000000000001'::uuid,
    'RetailPlus Inc',
    'a2000001-0000-4000-8000-000000000008'::uuid,
    'slack', '#retailplus-campaign',
    'We are frustrated with the delay on the March campaign. Leadership is concerned about missing the launch window.',
    'inbound', NOW() - INTERVAL '2 days'
  ),
  (
    'c1000003-0000-4000-8000-000000000002'::uuid,
    'RetailPlus Inc',
    'a2000001-0000-4000-8000-000000000008'::uuid,
    'zoom', 'Campaign recovery call',
    'Client asked for daily updates until paid ads are live. Mentioned evaluating other agencies.',
    'inbound', NOW() - INTERVAL '8 days'
  ),

  -- Global Manufacturing: critical Slack + email
  (
    'c1000004-0000-4000-8000-000000000001'::uuid,
    'Global Manufacturing',
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'slack', '#global-mfg-alerts',
    'Publishing has completely stopped and leadership is very disappointed. We may need to escalate.',
    'inbound', NOW() - INTERVAL '1 day'
  ),
  (
    'c1000004-0000-4000-8000-000000000002'::uuid,
    'Global Manufacturing',
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'teams', 'ABM pilot standup',
    'Client unhappy with nurture sequence delays. Requested executive sponsor call.',
    'inbound', NOW() - INTERVAL '3 days'
  ),
  (
    'c1000004-0000-4000-8000-000000000003'::uuid,
    'Global Manufacturing',
    'a2000001-0000-4000-8000-000000000011'::uuid,
    'email', 'Re: Q1 launch status',
    'Email nurture work has been blocked for weeks. This is unacceptable for our Q1 launch.',
    'inbound', NOW() - INTERVAL '5 days'
  )
) AS v(comm_id, client_name, project_id, comm_type, subject, content, direction, created_at)
JOIN public.clients c ON c.name = v.client_name
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  direction = EXCLUDED.direction,
  created_at = EXCLUDED.created_at;
