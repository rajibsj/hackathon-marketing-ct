-- Add demo tasks only when referenced brand and assignee exist
INSERT INTO public.project_tasks (title, description, brand_id, assigned_to, status, priority, category)
SELECT 'Add FAQ Section',
  'Address common questions about pricing, security, and setup for AgentForge marketing readiness.',
  '43713c5f-e7dc-4514-8b14-50141a81b083'::uuid,
  '1bf016b3-c0b1-4a4b-aed4-7b2bcef32dcc'::uuid,
  'todo', 'high', 'content'
WHERE EXISTS (SELECT 1 FROM public.brands WHERE id = '43713c5f-e7dc-4514-8b14-50141a81b083'::uuid)
  AND EXISTS (SELECT 1 FROM public.users WHERE id = '1bf016b3-c0b1-4a4b-aed4-7b2bcef32dcc'::uuid)
  AND NOT EXISTS (SELECT 1 FROM public.project_tasks WHERE title = 'Add FAQ Section');

INSERT INTO public.project_tasks (title, description, brand_id, assigned_to, status, priority, category)
SELECT 'Add Testimonials Section',
  'Add 3-5 quotes from early users/nonprofits to build trust and credibility on the homepage.',
  '43713c5f-e7dc-4514-8b14-50141a81b083'::uuid,
  '1bf016b3-c0b1-4a4b-aed4-7b2bcef32dcc'::uuid,
  'todo', 'high', 'content'
WHERE EXISTS (SELECT 1 FROM public.brands WHERE id = '43713c5f-e7dc-4514-8b14-50141a81b083'::uuid)
  AND EXISTS (SELECT 1 FROM public.users WHERE id = '1bf016b3-c0b1-4a4b-aed4-7b2bcef32dcc'::uuid)
  AND NOT EXISTS (SELECT 1 FROM public.project_tasks WHERE title = 'Add Testimonials Section');

INSERT INTO public.project_tasks (title, description, brand_id, assigned_to, status, priority, category)
SELECT 'Improve SEO',
  'Add SEO meta tags including Open Graph images, Twitter cards, and meta descriptions for all pages.',
  '43713c5f-e7dc-4514-8b14-50141a81b083'::uuid,
  '1bf016b3-c0b1-4a4b-aed4-7b2bcef32dcc'::uuid,
  'todo', 'high', 'seo'
WHERE EXISTS (SELECT 1 FROM public.brands WHERE id = '43713c5f-e7dc-4514-8b14-50141a81b083'::uuid)
  AND EXISTS (SELECT 1 FROM public.users WHERE id = '1bf016b3-c0b1-4a4b-aed4-7b2bcef32dcc'::uuid)
  AND NOT EXISTS (SELECT 1 FROM public.project_tasks WHERE title = 'Improve SEO');
