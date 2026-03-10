-- Migration: Corriger les vues admin dashboard pour appliquer les permissions
-- de l'appelant (SECURITY INVOKER) et respecter le RLS.
-- Date: 2026-03-07

ALTER VIEW public.admin_dashboard_recruiters_v
  SET (security_invoker = on);

ALTER VIEW public.admin_dashboard_establishments_v
  SET (security_invoker = on);
