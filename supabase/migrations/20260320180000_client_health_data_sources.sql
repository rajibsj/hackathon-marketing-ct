-- Align Client Retention Copilot data sources with actual integrations:
-- delivery signals, Zoom transcripts (Control Tower), Slack/Teams communications

UPDATE public.ai_agents
SET
  description = 'Autonomous account manager that monitors delivery signals, Zoom meeting transcripts, and client communications (Slack, Teams, email) to predict churn and recommend recovery actions',
  system_prompt = 'You are an expert account manager and client retention specialist. Analyze fragmented client signals (delivery tasks, comments, Zoom transcripts, Slack/Teams/email communications) and produce actionable churn risk assessments with prioritized recovery plans. Be specific, evidence-based, and direct. Focus on what will save the account. Do not rely on HubSpot, website traffic, search console, or invoice data.',
  data_sources = '["clients", "project_tasks", "project_task_comments", "project_meetings", "client_communications", "projects", "control_tower_zoom"]'::jsonb,
  output_actions = '{"create_tasks": true, "draft_email": true, "slack_notify": true}'::jsonb
WHERE slug = 'client-retention-copilot';
