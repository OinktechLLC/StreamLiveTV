
-- Banned users table
CREATE TABLE IF NOT EXISTS public.banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  banned_at timestamptz NOT NULL DEFAULT now(),
  banned_by uuid,
  reason text NOT NULL DEFAULT 'Нарушение правил платформы',
  rule_code text DEFAULT '2.19'
);

ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Everyone can check if they're banned (needed for auth check)
CREATE POLICY "Anyone can check ban status" ON public.banned_users
  FOR SELECT TO authenticated, anon USING (true);

-- Only admins can ban
CREATE POLICY "Admins can ban users" ON public.banned_users
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can unban users" ON public.banned_users
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
