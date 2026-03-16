-- Autonomous channel moderation engine (trigger + periodic scan)

CREATE TABLE IF NOT EXISTS public.channel_moderation_settings (
  id integer PRIMARY KEY DEFAULT 1,
  sensitivity numeric NOT NULL DEFAULT 0.65 CHECK (sensitivity > 0 AND sensitivity <= 1),
  min_title_length integer NOT NULL DEFAULT 4,
  min_description_length integer NOT NULL DEFAULT 12,
  spam_regex text NOT NULL DEFAULT '(casino|казино|ставк|бет|spam|скам|porn|порно|xxx|crypto|pump|dump|free money|реклама)',
  protected_usernames text[] NOT NULL DEFAULT ARRAY['oinktech', 'twixoff'],
  forced_banned_usernames text[] NOT NULL DEFAULT ARRAY['iwisisis'],
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.channel_moderation_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS banned_users_user_id_uidx
ON public.banned_users (user_id);

CREATE OR REPLACE FUNCTION public.evaluate_channel_junk(
  p_username text,
  p_title text,
  p_description text,
  p_category_id uuid,
  p_channel_type public.channel_type
)
RETURNS TABLE(score numeric, reasons text[])
LANGUAGE plpgsql
AS $$
DECLARE
  cfg record;
  n_username text := lower(coalesce(trim(p_username), ''));
  n_title text := lower(coalesce(trim(p_title), ''));
  n_description text := lower(coalesce(trim(p_description), ''));
  local_score numeric := 0;
  local_reasons text[] := ARRAY[]::text[];
BEGIN
  SELECT * INTO cfg
  FROM public.channel_moderation_settings
  WHERE id = 1;

  IF n_username = ANY(cfg.protected_usernames) THEN
    RETURN QUERY SELECT 0::numeric, ARRAY[]::text[];
    RETURN;
  END IF;

  -- Gibberish-like title: too many non-letter chars or no vowels in long token.
  IF n_title = '' OR length(regexp_replace(n_title, '[^a-zа-яё0-9]+', '', 'gi')) < cfg.min_title_length THEN
    local_score := local_score + 0.35;
    local_reasons := array_append(local_reasons, 'Название канала выглядит бессодержательным');
  END IF;

  IF n_title ~ '(.)\1{4,}' OR n_title ~ '^[^a-zа-яё0-9]{3,}$' THEN
    local_score := local_score + 0.3;
    local_reasons := array_append(local_reasons, 'Название канала содержит подозрительный набор символов');
  END IF;

  IF n_description = '' OR length(regexp_replace(n_description, '\s+', '', 'g')) < cfg.min_description_length THEN
    local_score := local_score + 0.35;
    local_reasons := array_append(local_reasons, 'Описание отсутствует или слишком короткое');
  END IF;

  IF n_description <> '' AND n_description ~* cfg.spam_regex THEN
    local_score := local_score + 0.45;
    local_reasons := array_append(local_reasons, 'Описание содержит признаки спама или рекламы');
  END IF;

  IF n_title ~* cfg.spam_regex THEN
    local_score := local_score + 0.4;
    local_reasons := array_append(local_reasons, 'Название содержит спам-маркеры');
  END IF;

  IF p_category_id IS NULL THEN
    local_score := local_score + 0.2;
    local_reasons := array_append(local_reasons, 'Не указана тематика канала');
  END IF;

  IF p_channel_type NOT IN ('tv', 'radio') THEN
    local_score := local_score + 0.2;
    local_reasons := array_append(local_reasons, 'Неопределённый тип контента канала');
  END IF;

  IF local_score > 1 THEN
    local_score := 1;
  END IF;

  RETURN QUERY SELECT local_score, local_reasons;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_channel_auto_moderation(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg record;
  ch record;
  result record;
  reason_text text;
BEGIN
  SELECT * INTO cfg
  FROM public.channel_moderation_settings
  WHERE id = 1;

  SELECT c.id, c.user_id, c.title, c.description, c.category_id, c.channel_type, p.username
  INTO ch
  FROM public.channels c
  JOIN public.profiles p ON p.id = c.user_id
  WHERE c.id = p_channel_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Explicit allowlist: official channels never auto-hidden.
  IF lower(ch.username) = ANY(cfg.protected_usernames) THEN
    UPDATE public.channels
    SET is_hidden = false,
        hidden_at = NULL,
        hidden_reason = NULL,
        updated_at = now()
    WHERE id = p_channel_id;
    RETURN;
  END IF;

  -- Forced account blocking list for severe abuse cases.
  IF lower(ch.username) = ANY(cfg.forced_banned_usernames) THEN
    INSERT INTO public.banned_users (user_id, reason, rule_code)
    VALUES (ch.user_id, 'Автоматическая блокировка: систематический спам и нарушение правил платформы', 'AUTO-2.19')
    ON CONFLICT (user_id) DO UPDATE
      SET reason = EXCLUDED.reason,
          rule_code = EXCLUDED.rule_code,
          banned_at = now();

    UPDATE public.channels
    SET is_hidden = true,
        hidden_at = now(),
        hidden_reason = 'Автоматическая модерация: канал заблокирован за низкое качество или нарушение правил платформы',
        updated_at = now()
    WHERE user_id = ch.user_id;

    RETURN;
  END IF;

  SELECT * INTO result
  FROM public.evaluate_channel_junk(ch.username, ch.title, ch.description, ch.category_id, ch.channel_type);

  IF result.score >= cfg.sensitivity THEN
    reason_text := array_to_string(result.reasons, '; ');

    UPDATE public.channels
    SET is_hidden = true,
        hidden_at = now(),
        hidden_reason = concat('Автоматическая модерация: ', coalesce(nullif(reason_text, ''), 'Низкое качество или нарушение правил платформы')),
        updated_at = now()
    WHERE id = p_channel_id;
  ELSE
    -- Unhide channel automatically if quality recovered and it wasn't manually hidden for other reasons.
    UPDATE public.channels
    SET is_hidden = false,
        hidden_at = NULL,
        hidden_reason = NULL,
        updated_at = now()
    WHERE id = p_channel_id
      AND coalesce(hidden_reason, '') ILIKE 'Автоматическая модерация:%';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_channel_auto_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.apply_channel_auto_moderation(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS channel_auto_moderation_trigger ON public.channels;
CREATE TRIGGER channel_auto_moderation_trigger
AFTER INSERT OR UPDATE OF title, description, category_id, channel_type
ON public.channels
FOR EACH ROW
EXECUTE FUNCTION public.trg_channel_auto_moderation();

CREATE OR REPLACE FUNCTION public.run_channel_auto_moderation(p_limit integer DEFAULT 200)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  processed integer := 0;
  rec record;
BEGIN
  FOR rec IN
    SELECT id
    FROM public.channels
    ORDER BY updated_at DESC
    LIMIT greatest(coalesce(p_limit, 200), 1)
  LOOP
    PERFORM public.apply_channel_auto_moderation(rec.id);
    processed := processed + 1;
  END LOOP;

  RETURN processed;
END;
$$;

-- One-time backfill for existing channels.
SELECT public.run_channel_auto_moderation(10000);
