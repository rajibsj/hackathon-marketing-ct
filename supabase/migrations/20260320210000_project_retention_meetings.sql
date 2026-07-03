ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS retention_meeting_transcripts JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS retention_meeting_signal_text TEXT;

COMMENT ON COLUMN public.projects.retention_meeting_transcripts IS
  'Array of { id, title, meeting_date, transcript_link, transcript_text?, generated_text? } for retention copilot';
COMMENT ON COLUMN public.projects.retention_meeting_signal_text IS
  'Consolidated meeting signal text generated for the retention copilot';

-- Migrate legacy single link into the new structure
UPDATE public.projects
SET retention_meeting_transcripts = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'title', 'Zoom meeting',
    'meeting_date', COALESCE(updated_at, created_at, NOW())::text,
    'transcript_link', zoom_transcript_link,
    'transcript_text', NULL,
    'generated_text', NULL
  )
)
WHERE zoom_transcript_link IS NOT NULL
  AND btrim(zoom_transcript_link) <> ''
  AND (
    retention_meeting_transcripts IS NULL
    OR retention_meeting_transcripts = '[]'::jsonb
  );
