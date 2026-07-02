-- Ensure demo admin has super_admin role (fixes typo in original demo credentials migration)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role
FROM public.users u
INNER JOIN auth.users au ON au.id = u.id
WHERE u.email = 'demo.admin@sjinnovation.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- PM+ can read all active clients for retention copilot portfolio
DROP POLICY IF EXISTS "PM and above can view all clients for portfolio" ON public.clients;
CREATE POLICY "PM and above can view all clients for portfolio"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND (
      has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'manager'::app_role)
      OR has_role(auth.uid(), 'pm'::app_role)
    )
  );
