-- Enable RLS on testimonial_submission_tokens
ALTER TABLE public.testimonial_submission_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read access for token validation (needed for submission page)
DROP POLICY IF EXISTS "Anyone can validate tokens" ON public.testimonial_submission_tokens;
CREATE POLICY "Anyone can validate tokens"
ON public.testimonial_submission_tokens
FOR SELECT
USING (expires_at > NOW() AND used_at IS NULL);

-- PMs and above can manage tokens
DROP POLICY IF EXISTS "PMs can insert tokens" ON public.testimonial_submission_tokens;
CREATE POLICY "PMs can insert tokens"
ON public.testimonial_submission_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'manager', 'pm')
  )
);

DROP POLICY IF EXISTS "PMs can update tokens" ON public.testimonial_submission_tokens;
CREATE POLICY "PMs can update tokens"
ON public.testimonial_submission_tokens
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'manager', 'pm')
  )
);