ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS zoom_transcript_link TEXT;

COMMENT ON COLUMN public.projects.zoom_transcript_link IS 'URL to Zoom meeting transcript for this project';
