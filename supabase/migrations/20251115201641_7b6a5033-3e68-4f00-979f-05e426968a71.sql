-- Seed hackathon event and sample employees (schema-aware)
DO $$
BEGIN
  -- Hackathon event: two possible schemas depending on which migration created the table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_events' AND column_name = 'registration_deadline'
  ) THEN
    INSERT INTO public.hackathon_events (
      title, description, start_date, end_date, registration_deadline,
      status, max_team_size, rules, prizes
    ) VALUES (
      'November AI Agent Hackathon',
      'Build innovative AI agents that solve real-world problems using modern frameworks like OpenAI, Anthropic, LangChain, and more. Compete for prizes and showcase your creativity!',
      '2025-11-20', '2025-11-22', '2025-11-19', 'active', 4,
      '{"allowed_technologies": ["OpenAI", "Anthropic", "LangChain", "Google AI", "Any AI Framework"]}'::jsonb,
      '{"first": "$5000", "second": "$3000", "third": "$1000"}'::jsonb
    );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hackathon_events' AND column_name = 'team_size_max'
  ) THEN
    INSERT INTO public.hackathon_events (title, description, start_date, end_date, status, team_size_max)
    VALUES (
      'November AI Agent Hackathon',
      'Build innovative AI agents that solve real-world problems using modern frameworks like OpenAI, Anthropic, LangChain, and more.',
      '2025-11-20', '2025-11-22', 'open', 4
    );
  ELSE
    RAISE NOTICE 'Skipping hackathon_events seed: table schema not recognized.';
  END IF;

  -- Sample employees: skip if employees table uses job_title (hackathon schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'title'
  ) THEN
    INSERT INTO public.employees (employee_id, email, first_name, last_name, department, title, is_active, synced_at)
    VALUES
      ('EMP001', 'john.doe@company.com', 'John', 'Doe', 'Engineering', 'Senior Developer', true, now()),
      ('EMP002', 'jane.smith@company.com', 'Jane', 'Smith', 'Product', 'Product Manager', true, now()),
      ('EMP003', 'mike.johnson@company.com', 'Mike', 'Johnson', 'Design', 'UX Designer', true, now()),
      ('EMP004', 'sarah.williams@company.com', 'Sarah', 'Williams', 'Engineering', 'Full Stack Developer', true, now()),
      ('EMP005', 'david.brown@company.com', 'David', 'Brown', 'Data Science', 'ML Engineer', true, now())
    ON CONFLICT (employee_id) DO NOTHING;
  ELSE
    RAISE NOTICE 'Skipping employees seed: using hackathon employees schema (job_title).';
  END IF;
END $$;
