-- =============================================
-- Migration 009: Suppression de la fonction call_release_payments_api
-- =============================================
-- Le scheduling est désormais assuré par Vercel Cron (vercel.json).
-- Cette fonction n'est plus utilisée ; la supprimer si elle existe (projets
-- ayant appliqué 008 avant la migration Vercel).
-- =============================================

DROP FUNCTION IF EXISTS public.call_release_payments_api();
