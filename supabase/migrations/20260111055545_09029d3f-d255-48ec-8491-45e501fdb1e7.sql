-- Insert demo brands only when the owner user exists (fresh DBs skip seed data)
INSERT INTO public.brands (name, slug, owner_id, status, type, is_active)
SELECT 'PlatePresence', 'platepresence', 'e8e40d1a-26ae-4aa0-91a5-61e1df7c27d8'::uuid, 'active', 'internal', true
WHERE EXISTS (SELECT 1 FROM public.users WHERE id = 'e8e40d1a-26ae-4aa0-91a5-61e1df7c27d8'::uuid)
  AND NOT EXISTS (SELECT 1 FROM public.brands WHERE slug = 'platepresence');

INSERT INTO public.brands (name, slug, owner_id, status, type, is_active)
SELECT 'Non-Profit Resource', 'non-profit-resource', 'e8e40d1a-26ae-4aa0-91a5-61e1df7c27d8'::uuid, 'active', 'internal', true
WHERE EXISTS (SELECT 1 FROM public.users WHERE id = 'e8e40d1a-26ae-4aa0-91a5-61e1df7c27d8'::uuid)
  AND NOT EXISTS (SELECT 1 FROM public.brands WHERE slug = 'non-profit-resource');
