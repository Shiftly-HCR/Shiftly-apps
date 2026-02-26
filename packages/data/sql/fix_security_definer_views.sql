-- Migration: Passer les vues sensibles de SECURITY DEFINER à SECURITY INVOKER
-- Date: 2026-02-26
-- Description:
--   Les vues payments_ready_for_distribution, payments_pending_release et
--   commercial_stats ont été créées sans l'option security_invoker, ce qui
--   leur confère le comportement SECURITY DEFINER par défaut : elles s'exécutent
--   avec les droits du créateur (postgres) et contournent le RLS des tables
--   sous-jacentes.
--
--   Avec security_invoker = on (PostgreSQL 15+), les vues s'exécutent avec les
--   droits de l'appelant. Les politiques RLS de mission_payments, mission_finance,
--   missions, profiles s'appliquent normalement.
--
--   Ces vues ne sont pas utilisées dans le code applicatif (le cron utilise
--   la fonction RPC release_due_payments()). Le service role conserve un accès
--   complet car il bypasse toujours le RLS.

ALTER VIEW public.payments_ready_for_distribution SET (security_invoker = on);
ALTER VIEW public.payments_pending_release         SET (security_invoker = on);
ALTER VIEW public.commercial_stats                 SET (security_invoker = on);
