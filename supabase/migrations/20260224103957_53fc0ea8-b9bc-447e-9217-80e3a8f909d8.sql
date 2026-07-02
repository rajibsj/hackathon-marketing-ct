
-- ============================================
-- PHASE 1A: Enums, Functions, Foundation Tables
-- ============================================

-- Create custom enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'pm', 'brand_manager', 'manager', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.linkedin_post_source AS ENUM ('trend', 'influencer', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add avatar_url to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Security definer: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Security definer: get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid()
  ORDER BY CASE role::text
    WHEN 'super_admin' THEN 5
    WHEN 'manager' THEN 4
    WHEN 'brand_manager' THEN 3
    WHEN 'pm' THEN 2
    ELSE 1
  END DESC LIMIT 1;
$$;

-- RLS on existing tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users" ON public.users FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users" ON public.users FOR INSERT TO authenticated WITH CHECK (true);

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can view orgs" ON public.organizations;
CREATE POLICY "Auth can view orgs" ON public.organizations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage orgs" ON public.organizations;
CREATE POLICY "Admins manage orgs" ON public.organizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- User Brands (create BEFORE the function that references it)
CREATE TABLE IF NOT EXISTS public.user_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, brand_id)
);
ALTER TABLE public.user_brands ENABLE ROW LEVEL SECURITY;

-- NOW create brand access function
CREATE OR REPLACE FUNCTION public.user_has_brand_access(_user_id uuid, _brand_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_brands WHERE user_id = _user_id AND brand_id = _brand_id)
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin'::app_role, 'manager'::app_role));
$$;

-- Brand & user_brands RLS policies
DROP POLICY IF EXISTS "Users view accessible brands" ON public.brands;
CREATE POLICY "Users view accessible brands" ON public.brands FOR SELECT TO authenticated
  USING (public.user_has_brand_access(auth.uid(), id));
DROP POLICY IF EXISTS "Admins manage brands" ON public.brands;
CREATE POLICY "Admins manage brands" ON public.brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Users view own brand access" ON public.user_brands;
CREATE POLICY "Users view own brand access" ON public.user_brands FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "Admins manage brand access" ON public.user_brands;
CREATE POLICY "Admins manage brand access" ON public.user_brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- User Accountability Chart
CREATE TABLE IF NOT EXISTS public.user_accountability_chart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  serial_number INTEGER,
  type_of_work TEXT,
  responsibilities TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_accountability_chart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own chart" ON public.user_accountability_chart;
CREATE POLICY "Users view own chart" ON public.user_accountability_chart FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "Users manage own chart" ON public.user_accountability_chart;
CREATE POLICY "Users manage own chart" ON public.user_accountability_chart FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- AI Agents
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  system_prompt TEXT NOT NULL DEFAULT '',
  model_provider TEXT DEFAULT 'openai',
  model_version TEXT DEFAULT 'gpt-4o',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  knowledge_sources JSONB,
  external_data_sources JSONB,
  fallback_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view agents" ON public.ai_agents;
CREATE POLICY "Auth view agents" ON public.ai_agents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage agents" ON public.ai_agents;
CREATE POLICY "Admins manage agents" ON public.ai_agents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- AI Agent Runs
CREATE TABLE IF NOT EXISTS public.ai_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id),
  executed_by UUID REFERENCES public.users(id),
  execution_context JSONB,
  ai_summary TEXT,
  generated_tasks JSONB,
  status TEXT DEFAULT 'completed',
  category TEXT,
  output JSONB,
  approval_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  brand_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_agent_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own runs" ON public.ai_agent_runs;
CREATE POLICY "Users view own runs" ON public.ai_agent_runs FOR SELECT TO authenticated
  USING (executed_by = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "Auth insert runs" ON public.ai_agent_runs;
CREATE POLICY "Auth insert runs" ON public.ai_agent_runs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Users update own runs" ON public.ai_agent_runs;
CREATE POLICY "Users update own runs" ON public.ai_agent_runs FOR UPDATE TO authenticated
  USING (executed_by = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- AI Configurations
CREATE TABLE IF NOT EXISTS public.ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_context JSONB,
  model_settings JSONB,
  prompts JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view config" ON public.ai_configurations;
CREATE POLICY "Auth view config" ON public.ai_configurations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage config" ON public.ai_configurations;
CREATE POLICY "Admins manage config" ON public.ai_configurations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Agent Memories
CREATE TABLE IF NOT EXISTS public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id TEXT,
  agent_id UUID REFERENCES public.ai_agents(id),
  memory_text TEXT NOT NULL,
  tags TEXT[],
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view memories" ON public.agent_memories;
CREATE POLICY "Auth view memories" ON public.agent_memories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth insert memories" ON public.agent_memories;
CREATE POLICY "Auth insert memories" ON public.agent_memories FOR INSERT TO authenticated WITH CHECK (true);

-- Knowledge Base Categories
CREATE TABLE IF NOT EXISTS public.knowledge_base_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.knowledge_base_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.knowledge_base_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view kb cats" ON public.knowledge_base_categories;
CREATE POLICY "Auth view kb cats" ON public.knowledge_base_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage kb cats" ON public.knowledge_base_categories;
CREATE POLICY "Admins manage kb cats" ON public.knowledge_base_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Knowledge Base
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.knowledge_base_categories(id),
  source_url TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view kb" ON public.knowledge_base;
CREATE POLICY "Auth view kb" ON public.knowledge_base FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage kb" ON public.knowledge_base;
CREATE POLICY "Admins manage kb" ON public.knowledge_base FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Knowledge Base Files
CREATE TABLE IF NOT EXISTS public.knowledge_base_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category_id UUID REFERENCES public.knowledge_base_categories(id),
  uploaded_by UUID REFERENCES public.users(id),
  is_indexed BOOLEAN DEFAULT false,
  embedding_count INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.knowledge_base_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view kb files" ON public.knowledge_base_files;
CREATE POLICY "Auth view kb files" ON public.knowledge_base_files FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage kb files" ON public.knowledge_base_files;
CREATE POLICY "Admins manage kb files" ON public.knowledge_base_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Knowledge Sources
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT,
  brand_id UUID,
  is_company_wide BOOLEAN DEFAULT false,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view sources" ON public.knowledge_sources;
CREATE POLICY "Auth view sources" ON public.knowledge_sources FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage sources" ON public.knowledge_sources;
CREATE POLICY "Admins manage sources" ON public.knowledge_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Knowledge Files
CREATE TABLE IF NOT EXISTS public.knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  uploaded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view kf" ON public.knowledge_files;
CREATE POLICY "Auth view kf" ON public.knowledge_files FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage kf" ON public.knowledge_files;
CREATE POLICY "Admins manage kf" ON public.knowledge_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Brand Knowledge Files
CREATE TABLE IF NOT EXISTS public.brand_knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.users(id),
  is_indexed BOOLEAN DEFAULT false,
  embedding_count INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_knowledge_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view brand knowledge" ON public.brand_knowledge_files;
CREATE POLICY "Users view brand knowledge" ON public.brand_knowledge_files FOR SELECT TO authenticated
  USING (public.user_has_brand_access(auth.uid(), brand_id));
DROP POLICY IF EXISTS "Admins manage brand knowledge" ON public.brand_knowledge_files;
CREATE POLICY "Admins manage brand knowledge" ON public.brand_knowledge_files FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Brand File Comments
CREATE TABLE IF NOT EXISTS public.brand_file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES public.brand_knowledge_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_file_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view bfc" ON public.brand_file_comments;
CREATE POLICY "Auth view bfc" ON public.brand_file_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users insert bfc" ON public.brand_file_comments;
CREATE POLICY "Users insert bfc" ON public.brand_file_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Brand KPIs
CREATE TABLE IF NOT EXISTS public.brand_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_kpis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view kpis" ON public.brand_kpis;
CREATE POLICY "Users view kpis" ON public.brand_kpis FOR SELECT TO authenticated
  USING (public.user_has_brand_access(auth.uid(), brand_id));
DROP POLICY IF EXISTS "Admins manage kpis" ON public.brand_kpis;
CREATE POLICY "Admins manage kpis" ON public.brand_kpis FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- AI Generated Images
CREATE TABLE IF NOT EXISTS public.ai_generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  image_url TEXT,
  model TEXT DEFAULT 'dall-e-3',
  brand_id UUID,
  generated_by UUID REFERENCES public.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_generated_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view images" ON public.ai_generated_images;
CREATE POLICY "Auth view images" ON public.ai_generated_images FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth create images" ON public.ai_generated_images;
CREATE POLICY "Auth create images" ON public.ai_generated_images FOR INSERT TO authenticated WITH CHECK (true);

-- Gemini Videos
CREATE TABLE IF NOT EXISTS public.gemini_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL, video_url TEXT, status TEXT DEFAULT 'pending',
  brand_id UUID, generated_by UUID REFERENCES public.users(id), metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gemini_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view gv" ON public.gemini_videos;
CREATE POLICY "Auth view gv" ON public.gemini_videos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth create gv" ON public.gemini_videos;
CREATE POLICY "Auth create gv" ON public.gemini_videos FOR INSERT TO authenticated WITH CHECK (true);

-- Sora Videos
CREATE TABLE IF NOT EXISTS public.sora_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL, video_url TEXT, status TEXT DEFAULT 'pending',
  brand_id UUID, generated_by UUID REFERENCES public.users(id), metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sora_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view sv" ON public.sora_videos;
CREATE POLICY "Auth view sv" ON public.sora_videos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth create sv" ON public.sora_videos;
CREATE POLICY "Auth create sv" ON public.sora_videos FOR INSERT TO authenticated WITH CHECK (true);

-- N8n Workflow Configs
CREATE TABLE IF NOT EXISTS public.n8n_workflow_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL, workflow_url TEXT, webhook_url TEXT,
  is_enabled BOOLEAN DEFAULT true, config JSONB,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.n8n_workflow_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view n8n" ON public.n8n_workflow_configs;
CREATE POLICY "Admins view n8n" ON public.n8n_workflow_configs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "Admins manage n8n" ON public.n8n_workflow_configs;
CREATE POLICY "Admins manage n8n" ON public.n8n_workflow_configs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Integration Logs
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT, action TEXT, status TEXT,
  request_data JSONB, response_data JSONB, error_message TEXT,
  execution_time_ms INTEGER, created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view logs" ON public.integration_logs;
CREATE POLICY "Admins view logs" ON public.integration_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "System insert logs" ON public.integration_logs;
CREATE POLICY "System insert logs" ON public.integration_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Perplexity Settings
CREATE TABLE IF NOT EXISTS public.perplexity_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_encrypted TEXT, model TEXT DEFAULT 'llama-3.1-sonar-small-128k-online',
  is_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.perplexity_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view perp" ON public.perplexity_settings;
CREATE POLICY "Admins view perp" ON public.perplexity_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));
DROP POLICY IF EXISTS "Admins manage perp" ON public.perplexity_settings;
CREATE POLICY "Admins manage perp" ON public.perplexity_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- User Google Tokens
CREATE TABLE IF NOT EXISTS public.user_google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT, refresh_token TEXT, token_expiry TIMESTAMPTZ, scopes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.user_google_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own tokens" ON public.user_google_tokens;
CREATE POLICY "Users view own tokens" ON public.user_google_tokens FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users manage own tokens" ON public.user_google_tokens;
CREATE POLICY "Users manage own tokens" ON public.user_google_tokens FOR ALL TO authenticated USING (user_id = auth.uid());

-- User Permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL, resource_type TEXT, resource_id UUID,
  granted_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own perms" ON public.user_permissions;
CREATE POLICY "Users view own perms" ON public.user_permissions FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage perms" ON public.user_permissions;
CREATE POLICY "Admins manage perms" ON public.user_permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Role Permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL, permission TEXT NOT NULL, resource_type TEXT
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view role perms" ON public.role_permissions;
CREATE POLICY "Auth view role perms" ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- CollabAI Agents
CREATE TABLE IF NOT EXISTS public.collabai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, config JSONB, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.collabai_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view collabai" ON public.collabai_agents;
CREATE POLICY "Auth view collabai" ON public.collabai_agents FOR SELECT TO authenticated USING (true);

-- AI Shared Resources
CREATE TABLE IF NOT EXISTS public.ai_shared_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, resource_type TEXT, content JSONB,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_shared_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth view shared" ON public.ai_shared_resources;
CREATE POLICY "Auth view shared" ON public.ai_shared_resources FOR SELECT TO authenticated USING (true);
