-- Allow reporters to comment on their own feedback submissions
DROP POLICY IF EXISTS "Users can comment on own feedback" ON public.feedback_comments;

DROP POLICY IF EXISTS "Users can comment on own feedback" ON own;
CREATE POLICY "Users can comment on own feedback"
  ON public.feedback_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.feedback_reports fr
      WHERE fr.id = feedback_comments.feedback_id
        AND fr.created_by = auth.uid()
    )
  );
