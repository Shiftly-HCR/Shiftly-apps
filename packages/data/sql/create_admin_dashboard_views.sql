-- =============================================
-- Vues SQL pour le dashboard admin (pilotage recruiters + establishments)
-- =============================================

DROP VIEW IF EXISTS public.admin_dashboard_recruiters_v;
CREATE VIEW public.admin_dashboard_recruiters_v AS
SELECT
  p.id AS recruiter_id,
  p.first_name,
  p.last_name,
  p.email,
  p.is_premium,
  COUNT(DISTINCT e.id)::BIGINT AS establishments_count,
  COUNT(DISTINCT m.id)::BIGINT AS missions_count
FROM public.profiles p
LEFT JOIN public.establishments e ON e.owner_id = p.id
LEFT JOIN public.missions m ON m.recruiter_id = p.id
WHERE p.role = 'recruiter'
GROUP BY p.id, p.first_name, p.last_name, p.email, p.is_premium;
ALTER VIEW public.admin_dashboard_recruiters_v SET (security_invoker = on);

COMMENT ON VIEW public.admin_dashboard_recruiters_v IS
  'Vue agrégée pour le dashboard admin: recruiters + compteurs establishments/missions';

DROP VIEW IF EXISTS public.admin_dashboard_establishments_v;
CREATE VIEW public.admin_dashboard_establishments_v AS
SELECT
  e.id AS establishment_id,
  e.name,
  e.city,
  e.postal_code,
  e.owner_id AS recruiter_id,
  rp.first_name AS recruiter_first_name,
  rp.last_name AS recruiter_last_name,
  rp.email AS recruiter_email,
  e.commercial_id,
  cp.first_name AS commercial_first_name,
  cp.last_name AS commercial_last_name,
  cp.email AS commercial_email,
  COUNT(DISTINCT m.id)::BIGINT AS missions_count
FROM public.establishments e
LEFT JOIN public.profiles rp ON rp.id = e.owner_id
LEFT JOIN public.profiles cp ON cp.id = e.commercial_id
LEFT JOIN public.missions m ON m.establishment_id = e.id
GROUP BY
  e.id,
  e.name,
  e.city,
  e.postal_code,
  e.owner_id,
  rp.first_name,
  rp.last_name,
  rp.email,
  e.commercial_id,
  cp.first_name,
  cp.last_name,
  cp.email;
ALTER VIEW public.admin_dashboard_establishments_v SET (security_invoker = on);

COMMENT ON VIEW public.admin_dashboard_establishments_v IS
  'Vue agrégée pour le dashboard admin: establishments + recruiter/commercial + missions_count';
