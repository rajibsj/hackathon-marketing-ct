-- =====================================================
-- DEMO CREDENTIALS SETUP
-- =====================================================
-- Creates demo user profiles for testing/demo purposes
-- Demo Admin: demo.admin@sjinnovation.com (super_admin)
-- Demo User:  demo.user@sjinnovation.com (user)
--
-- After `supabase db push`, create matching auth users in Supabase Dashboard
-- → Authentication → Users (same emails). Roles are assigned automatically once
-- auth.users rows exist with matching IDs.
-- =====================================================

-- Drop the FK users.id → auth.users so placeholder profiles can be inserted first
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Insert demo user profiles
INSERT INTO public.users (id, email, first_name, last_name, status)
VALUES
  ('500b4a7f-4c4a-429e-a307-0601568c8525', 'demo.admin@sjinnovation.com', 'Demo', 'Admin', 'active'),
  ('b31fefe1-d78f-4160-85d3-298bccf9e02e', 'demo.user@sjinnovation.com',  'Demo', 'User',  'active')
ON CONFLICT (email) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    status = EXCLUDED.status;

-- Assign roles only when matching auth.users exist (fresh DBs skip until auth setup)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role
FROM public.users u
INNER JOIN auth.users au ON au.id = u.id
WHERE u.email = 'demo.admin@sjinnovation.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role
FROM public.users u
INNER JOIN auth.users au ON au.id = u.id
WHERE u.email = 'demo.user@sjinnovation.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email        ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role    ON public.user_roles(role);
