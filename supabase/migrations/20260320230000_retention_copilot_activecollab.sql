-- Retention copilot: ActiveCollab + Control Tower tasks, all clients, project-wise concerns

UPDATE public.ai_agents
SET
  description = 'Autonomous account manager that monitors ActiveCollab and Control Tower project tasks, comments, deadlines, and project-mapped meetings across the full client portfolio',
  system_prompt = 'You are an expert account manager and client retention specialist. Analyze ActiveCollab and Control Tower delivery signals (project tasks, comments, due dates) and project-mapped meeting transcripts. Address concerns project-by-project using project_breakdown. Produce actionable churn risk assessments with prioritized recovery plans. Do not rely on Slack, Teams, HubSpot, website traffic, search console, or invoice data.',
  data_sources = '["clients", "projects", "project_tasks", "project_task_comments", "project_meetings", "activecollab"]'::jsonb
WHERE slug = 'client-retention-copilot';
