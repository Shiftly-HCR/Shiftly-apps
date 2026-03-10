-- =============================================
-- Recherche freelance paginee cote SQL + indexes
-- =============================================

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city_of_residence TEXT;

CREATE OR REPLACE FUNCTION public.normalize_search_text(input_text TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT trim(regexp_replace(unaccent(lower(coalesce(input_text, ''))), '\\s+', ' ', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.search_published_freelances(
  p_query TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_availability TEXT DEFAULT NULL,
  p_badge TEXT DEFAULT NULL,
  p_daily_rate_min NUMERIC DEFAULT NULL,
  p_daily_rate_max NUMERIC DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  role TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  photo_url TEXT,
  bio TEXT,
  badges TEXT[],
  note NUMERIC,
  headline TEXT,
  location TEXT,
  city_of_residence TEXT,
  summary TEXT,
  skills TEXT[],
  is_premium BOOLEAN,
  daily_rate NUMERIC,
  hourly_rate NUMERIC,
  availability TEXT,
  siret TEXT,
  experience_count INTEGER,
  education_count INTEGER,
  completeness_score NUMERIC,
  search_blob TEXT,
  total_count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  WITH params AS (
    SELECT
      public.normalize_search_text(p_query) AS query_norm,
      public.normalize_search_text(p_position) AS position_norm,
      public.normalize_search_text(p_location) AS location_norm,
      public.normalize_search_text(p_availability) AS availability_norm,
      public.normalize_search_text(p_badge) AS badge_norm,
      GREATEST(COALESCE(p_page, 1), 1) AS safe_page,
      GREATEST(COALESCE(p_page_size, 50), 1) AS safe_page_size,
      ((GREATEST(COALESCE(p_page, 1), 1) - 1) * GREATEST(COALESCE(p_page_size, 50), 1) + 1) AS start_row,
      (GREATEST(COALESCE(p_page, 1), 1) * GREATEST(COALESCE(p_page_size, 50), 1)) AS end_row
  ),
  base AS (
    SELECT
      p.id,
      p.created_at,
      p.updated_at,
      p.role,
      p.first_name,
      p.last_name,
      p.email,
      p.photo_url,
      p.bio,
      p.badges,
      p.note,
      p.headline,
      p.location,
      p.city_of_residence,
      p.summary,
      p.skills,
      p.is_premium,
      p.daily_rate,
      p.hourly_rate,
      p.availability,
      p.siret,
      COUNT(DISTINCT fe.id)::INTEGER AS experience_count,
      COUNT(DISTINCT ed.id)::INTEGER AS education_count,
      COALESCE(
        string_agg(DISTINCT concat_ws(' ', fe.title, fe.company, fe.location, fe.description), ' '),
        ''
      ) AS experience_search_text,
      COALESCE(
        string_agg(DISTINCT concat_ws(' ', ed.school, ed.degree, ed.field), ' '),
        ''
      ) AS education_search_text
    FROM public.profiles p
    LEFT JOIN public.freelance_experiences fe ON fe.user_id = p.id
    LEFT JOIN public.freelance_educations ed ON ed.user_id = p.id
    WHERE p.role = 'freelance'
    GROUP BY p.id
  ),
  normalized AS (
    SELECT
      b.*,
      public.normalize_search_text(
        concat_ws(
          ' ',
          b.first_name,
          b.last_name,
          b.headline,
          b.bio,
          b.summary,
          b.location,
          b.city_of_residence,
          array_to_string(b.skills, ' '),
          b.experience_search_text,
          b.education_search_text
        )
      ) AS search_blob,
      public.normalize_search_text(b.location) AS location_norm,
      public.normalize_search_text(b.city_of_residence) AS city_of_residence_norm,
      public.normalize_search_text(b.availability) AS availability_norm,
      (
        (
          CASE WHEN b.photo_url IS NOT NULL AND btrim(b.photo_url) <> '' THEN 1 ELSE 0 END +
          CASE
            WHEN (b.bio IS NOT NULL AND btrim(b.bio) <> '')
              OR (b.summary IS NOT NULL AND btrim(b.summary) <> '')
            THEN 1 ELSE 0
          END +
          CASE WHEN b.experience_count > 0 THEN 1 ELSE 0 END +
          CASE WHEN b.education_count > 0 THEN 1 ELSE 0 END
        )::NUMERIC
        + LEAST(b.experience_count, 10) * 0.01
        + LEAST(b.education_count, 10) * 0.01
      ) AS completeness_score
    FROM base b
  ),
  filtered AS (
    SELECT n.*
    FROM normalized n
    CROSS JOIN params p
    WHERE
      (
        p.query_norm = '' OR NOT EXISTS (
          SELECT 1
          FROM unnest(regexp_split_to_array(p.query_norm, '\\s+')) AS token
          WHERE token <> '' AND position(token IN n.search_blob) = 0
        )
      )
      AND (p.position_norm = '' OR n.search_blob LIKE '%' || p.position_norm || '%')
      AND (
        p.location_norm = ''
        OR n.location_norm LIKE '%' || p.location_norm || '%'
        OR n.city_of_residence_norm LIKE '%' || p.location_norm || '%'
      )
      AND (p.availability_norm = '' OR n.availability_norm LIKE '%' || p.availability_norm || '%')
      AND (
        p.badge_norm = '' OR EXISTS (
          SELECT 1
          FROM unnest(COALESCE(n.badges, ARRAY[]::TEXT[])) AS badge
          WHERE public.normalize_search_text(badge) = p.badge_norm
        )
      )
      AND (p_daily_rate_min IS NULL OR n.daily_rate IS NULL OR n.daily_rate >= p_daily_rate_min)
      AND (p_daily_rate_max IS NULL OR n.daily_rate IS NULL OR n.daily_rate <= p_daily_rate_max)
  ),
  ranked AS (
    SELECT
      f.*,
      ROW_NUMBER() OVER (
        ORDER BY f.completeness_score DESC, f.updated_at DESC NULLS LAST
      ) AS row_num,
      COUNT(*) OVER() AS total_count
    FROM filtered f
  )
  SELECT
    r.id,
    r.created_at,
    r.updated_at,
    r.role,
    r.first_name,
    r.last_name,
    r.email,
    r.photo_url,
    r.bio,
    r.badges,
    r.note,
    r.headline,
    r.location,
    r.city_of_residence,
    r.summary,
    r.skills,
    r.is_premium,
    r.daily_rate,
    r.hourly_rate,
    r.availability,
    r.siret,
    r.experience_count,
    r.education_count,
    r.completeness_score,
    r.search_blob,
    r.total_count
  FROM ranked r
  CROSS JOIN params p
  WHERE r.row_num BETWEEN p.start_row AND p.end_row
  ORDER BY r.row_num;
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_role_updated_at
  ON public.profiles(role, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_freelance_experiences_user_id
  ON public.freelance_experiences(user_id);

CREATE INDEX IF NOT EXISTS idx_freelance_educations_user_id
  ON public.freelance_educations(user_id);

-- Index trigram par colonne (évite les contraintes IMMUTABLE des index d'expression)
CREATE INDEX IF NOT EXISTS idx_profiles_first_name_trgm
  ON public.profiles USING GIN (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name_trgm
  ON public.profiles USING GIN (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_headline_trgm
  ON public.profiles USING GIN (headline gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_bio_trgm
  ON public.profiles USING GIN (bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_summary_trgm
  ON public.profiles USING GIN (summary gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_location_trgm
  ON public.profiles USING GIN (location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_city_of_residence_trgm
  ON public.profiles USING GIN (city_of_residence gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_freelance_experiences_title_trgm
  ON public.freelance_experiences USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_freelance_experiences_company_trgm
  ON public.freelance_experiences USING GIN (company gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_freelance_experiences_location_trgm
  ON public.freelance_experiences USING GIN (location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_freelance_experiences_description_trgm
  ON public.freelance_experiences USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_freelance_educations_school_trgm
  ON public.freelance_educations USING GIN (school gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_freelance_educations_degree_trgm
  ON public.freelance_educations USING GIN (degree gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_freelance_educations_field_trgm
  ON public.freelance_educations USING GIN (field gin_trgm_ops);

-- Exécution RPC fiable en app (droits + contexte SQL)
ALTER FUNCTION public.search_published_freelances(
  TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER
) SECURITY DEFINER;

ALTER FUNCTION public.search_published_freelances(
  TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER
) SET search_path = public;

GRANT EXECUTE ON FUNCTION public.search_published_freelances(
  TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER
) TO authenticated, anon;
