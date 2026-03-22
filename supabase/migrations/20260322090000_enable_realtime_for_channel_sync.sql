-- Enable realtime sync for channel/player state so viewers instantly see media removals,
-- paid-only toggles, and deleted channels without reloading the page.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'media_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.media_content;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'deleted_channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deleted_channels;
  END IF;
END $$;
