-- Drop the overly complex policy and create proper role-based policies
DROP POLICY IF EXISTS "Team members can view and edit their assigned tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Users can view tasks for their brands" ON public.project_tasks;

-- SELECT: Users can view tasks they're assigned to, on their projects, or in their brands
DROP POLICY IF EXISTS "Users can view project tasks" ON public.project_tasks;
CREATE POLICY "Users can view project tasks" 
ON public.project_tasks 
FOR SELECT 
TO authenticated
USING (
  -- Super admins and managers can see all
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  -- Assigned to the user
  assigned_to = auth.uid() OR
  -- User is on the project team
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_tasks.project_id 
    AND (p.project_manager = auth.uid() OR auth.uid() = ANY(p.assigned_team))
  ) OR
  -- User has brand access
  (brand_id IS NOT NULL AND user_has_brand_access(auth.uid(), brand_id))
);

-- INSERT: Authenticated users can create tasks on projects they have access to
DROP POLICY IF EXISTS "Users can create project tasks" ON public.project_tasks;
CREATE POLICY "Users can create project tasks" 
ON public.project_tasks 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Super admins and managers can create any task
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  -- User is on the project team
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_tasks.project_id 
    AND (p.project_manager = auth.uid() OR auth.uid() = ANY(p.assigned_team))
  )
);

-- UPDATE: Users can update tasks they're assigned to or on their projects
DROP POLICY IF EXISTS "Users can update project tasks" ON public.project_tasks;
CREATE POLICY "Users can update project tasks" 
ON public.project_tasks 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_tasks.project_id 
    AND (p.project_manager = auth.uid() OR auth.uid() = ANY(p.assigned_team))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role) OR
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_tasks.project_id 
    AND (p.project_manager = auth.uid() OR auth.uid() = ANY(p.assigned_team))
  )
);

-- DELETE: Only super_admin and manager can delete tasks
DROP POLICY IF EXISTS "Admins can delete project tasks" ON public.project_tasks;
CREATE POLICY "Admins can delete project tasks" 
ON public.project_tasks 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);

-- Insert sample test tasks (only when demo project exists)
INSERT INTO public.project_tasks (project_id, title, description, status, priority, category, brand_id)
SELECT v.project_id, v.title, v.description, v.status, v.priority, v.category, v.brand_id
FROM (VALUES
  ('7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid, 'Design social media graphics', 'Create branded graphics for Instagram and Facebook posts', 'todo', 'high', 'design', NULL::uuid),
  ('7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid, 'Write blog post about SEO', 'Draft a 1500-word article on SEO best practices', 'in_progress', 'medium', 'content', NULL::uuid),
  ('7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid, 'Setup Google Analytics', 'Configure GA4 tracking for the website', 'todo', 'urgent', 'analytics', '4e5aa3d5-1f39-4159-bfd4-b112bc6b295f'::uuid),
  ('7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid, 'Fix mobile navigation bug', 'Navigation menu not closing on mobile devices', 'blocked', 'high', 'development', NULL::uuid),
  ('7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid, 'Review Q1 marketing report', 'Analyze performance metrics and prepare summary', 'review', 'medium', 'marketing', '4e5aa3d5-1f39-4159-bfd4-b112bc6b295f'::uuid),
  ('7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid, 'Customer support training', 'Prepare training materials for new support team', 'todo', 'low', 'support', NULL::uuid)
) AS v(project_id, title, description, status, priority, category, brand_id)
WHERE EXISTS (SELECT 1 FROM public.projects WHERE id = '7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid)
  AND NOT EXISTS (
    SELECT 1 FROM public.project_tasks
    WHERE project_id = '7cb9b5ab-70a7-4a21-8d80-c3eacd488f9c'::uuid
      AND title = 'Design social media graphics'
  );