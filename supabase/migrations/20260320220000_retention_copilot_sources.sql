-- Retention copilot: Control Tower tasks/comments/deadlines + project-mapped meetings only

UPDATE public.ai_agents
SET
  description = 'Autonomous account manager that monitors Control Tower tasks, comments, deadlines, and project-mapped meeting transcripts to predict churn',
  system_prompt = 'You are an expert account manager and client retention specialist. Analyze Control Tower delivery signals (project tasks, comments, due dates) and project-mapped meeting transcripts. Produce actionable churn risk assessments with prioritized recovery plans. Be specific, evidence-based, and direct. Do not rely on Slack, Teams, HubSpot, website traffic, search console, or invoice data.',
  data_sources = '["clients", "projects", "project_tasks", "project_task_comments", "project_meetings"]'::jsonb,
  output_actions = '{"create_tasks": true, "draft_email": true}'::jsonb
WHERE slug = 'client-retention-copilot';
