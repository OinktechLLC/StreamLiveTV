DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'channels'
      AND policyname = 'Admins can moderate channels'
  ) THEN
    CREATE POLICY "Admins can moderate channels"
      ON public.channels
      FOR UPDATE
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;
