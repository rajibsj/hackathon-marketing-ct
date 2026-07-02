-- Control Tower local sync tables
-- Idempotent: employees may already exist from hackathon module (different schema).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
    CREATE TABLE IF NOT EXISTS public.employees (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id text UNIQUE NOT NULL,
      email text UNIQUE NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      full_name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
      title text,
      department text,
      location text,
      phone text,
      role text,
      reporting_manager_id text,
      reporting_manager_email text,
      reporting_manager_name text,
      dotted_line_manager_email text,
      is_active boolean DEFAULT true,
      api_metadata jsonb DEFAULT '{}',
      synced_at timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  ELSE
    RAISE NOTICE 'Skipping employees CREATE in 20251113210041: table already exists.';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_synced_at ON public.employees(synced_at);

CREATE TABLE IF NOT EXISTS public.pods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  color text,
  is_active boolean DEFAULT true,
  member_count integer DEFAULT 0,
  api_metadata jsonb DEFAULT '{}',
  synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pods_pod_id ON public.pods(pod_id);
CREATE INDEX IF NOT EXISTS idx_pods_is_active ON public.pods(is_active);
CREATE INDEX IF NOT EXISTS idx_pods_synced_at ON public.pods(synced_at);

CREATE TABLE IF NOT EXISTS public.pod_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id text NOT NULL,
  employee_id text NOT NULL,
  user_id text,
  joined_at timestamptz,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pod_id, employee_id),
  FOREIGN KEY (pod_id) REFERENCES public.pods(pod_id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pod_members_pod_id ON public.pod_members(pod_id);
CREATE INDEX IF NOT EXISTS idx_pod_members_employee_id ON public.pod_members(employee_id);

CREATE TABLE IF NOT EXISTS public.control_tower_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  records_fetched integer DEFAULT 0,
  records_synced integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  triggered_by uuid,
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_sync_type ON public.control_tower_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.control_tower_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.control_tower_sync_logs(started_at DESC);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_tower_sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;
CREATE POLICY "Admins can view all employees"
ON public.employees FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'pm'::app_role)
);

DROP POLICY IF EXISTS "Service role can manage employees" ON public.employees;
CREATE POLICY "Service role can manage employees"
ON public.employees FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "Admins can view all pods" ON public.pods;
CREATE POLICY "Admins can view all pods"
ON public.pods FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'pm'::app_role)
);

DROP POLICY IF EXISTS "Service role can manage pods" ON public.pods;
CREATE POLICY "Service role can manage pods"
ON public.pods FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "Admins can view pod members" ON public.pod_members;
CREATE POLICY "Admins can view pod members"
ON public.pod_members FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'pm'::app_role)
);

DROP POLICY IF EXISTS "Service role can manage pod members" ON public.pod_members;
CREATE POLICY "Service role can manage pod members"
ON public.pod_members FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "Admins can view sync logs" ON public.control_tower_sync_logs;
CREATE POLICY "Admins can view sync logs"
ON public.control_tower_sync_logs FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "Service role can manage sync logs" ON public.control_tower_sync_logs;
CREATE POLICY "Service role can manage sync logs"
ON public.control_tower_sync_logs FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
