-- Add EOD submissions for Pritesh and Shahed
-- Guarded: these are production-specific seed rows tied to hardcoded UUIDs.
-- On a fresh database those users don't exist so we skip silently.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = '605515ce-e6e7-402d-8dca-b2340452f63d'
  ) THEN
    RAISE NOTICE 'Skipping 20251008163744: seed users not present, skipping EOD seed data.';
    RETURN;
  END IF;

  INSERT INTO team_eod_submissions (user_id, submission_date, task_links, notes)
  VALUES
    ('605515ce-e6e7-402d-8dca-b2340452f63d', CURRENT_DATE,
     ARRAY['https://app.activecollab.com/123/projects/456/tasks/AC-2001', 'https://app.activecollab.com/123/projects/456/tasks/AC-2002'],
     'Reviewed marketing campaign performance metrics and coordinated with team on upcoming social media strategy.'),
    ('605515ce-e6e7-402d-8dca-b2340452f63d', CURRENT_DATE - 1,
     ARRAY['https://app.activecollab.com/123/projects/456/tasks/AC-2003', 'https://app.activecollab.com/123/projects/456/tasks/AC-2004'],
     'Led weekly marketing team sync. Finalized Q1 marketing budget allocation.'),
    ('7481442a-d91b-471a-acc5-3dbd0929998e', CURRENT_DATE,
     ARRAY['https://app.activecollab.com/123/projects/456/tasks/AC-3001'],
     'System architecture review and security audit completion.'),
    ('7481442a-d91b-471a-acc5-3dbd0929998e', CURRENT_DATE - 1,
     ARRAY['https://app.activecollab.com/123/projects/456/tasks/AC-3002', 'https://app.activecollab.com/123/projects/456/tasks/AC-3003'],
     'Infrastructure optimization and deployment pipeline improvements.')
  ON CONFLICT DO NOTHING;

  INSERT INTO team_daily_summaries (user_id, summary_date, tasks_completed, hours_logged, productivity_score, key_accomplishments, concerns, ai_summary)
  VALUES
    ('605515ce-e6e7-402d-8dca-b2340452f63d', CURRENT_DATE, 3, 8.5, 92,
     ARRAY['Reviewed and optimized Facebook and Instagram ad campaigns resulting in 15% better CTR',
           'Coordinated with design team for upcoming product launch materials',
           'Analyzed competitor marketing strategies and prepared executive summary'],
     ARRAY[]::text[],
     '{"overall_summary": "Pritesh had an excellent day focusing on campaign optimization and team coordination.", "recommendations": ["Continue monitoring ad campaign performance daily"], "hours_analysis": "8.5 hours logged"}'::jsonb),
    ('605515ce-e6e7-402d-8dca-b2340452f63d', CURRENT_DATE - 1, 4, 9, 88,
     ARRAY['Led weekly marketing team synchronization meeting with 12 attendees',
           'Finalized Q1 marketing budget allocation across channels',
           'Reviewed and approved content calendar for next month',
           'One-on-one mentoring session with junior marketing executives'],
     ARRAY['Need to address delayed influencer partnership contracts']::text[],
     '{"overall_summary": "Strong performance from Pritesh in his managerial capacity.", "recommendations": ["Follow up on influencer contracts by end of week"], "hours_analysis": "9 hours logged"}'::jsonb),
    ('7481442a-d91b-471a-acc5-3dbd0929998e', CURRENT_DATE, 2, 7, 95,
     ARRAY['Completed comprehensive security audit of production systems',
           'Implemented automated backup verification system'],
     ARRAY[]::text[],
     '{"overall_summary": "Shahed delivered critical infrastructure work with high impact.", "recommendations": ["Share security audit findings with team"], "hours_analysis": "7 hours logged"}'::jsonb),
    ('7481442a-d91b-471a-acc5-3dbd0929998e', CURRENT_DATE - 1, 3, 8.5, 90,
     ARRAY['Optimized database query performance reducing load time by 40%',
           'Upgraded deployment pipeline with automated testing',
           'Code review and mentoring for 3 pull requests'],
     ARRAY[]::text[],
     '{"overall_summary": "Excellent technical contributions from Shahed.", "recommendations": ["Share optimization techniques in tech talk"], "hours_analysis": "8.5 hours logged"}'::jsonb),
    ('c1579d9d-f7d9-4f60-b83a-c61f6209f64e', CURRENT_DATE - 2, 2, 7.5, 82,
     ARRAY['Coordinated cross-functional project kickoff meeting',
           'Updated project timelines and resource allocation in project management tool'],
     ARRAY['Waiting on client feedback for requirements document']::text[],
     '{"overall_summary": "Anik effectively managed project coordination activities.", "recommendations": ["Send follow-up reminder to client"], "hours_analysis": "7.5 hours logged"}'::jsonb)
  ON CONFLICT DO NOTHING;
END $$;
