-- =============================================
-- Migration: Système de litiges et libération automatique
-- Date: 2026-01-17
-- Description: 
--   - Table mission_disputes pour les litiges (internes + Stripe)
--   - Colonnes sur mission_payments: has_dispute, problem_declared_at, release_at, released_at
--   - Fonction release_due_payments() avec verrouillage FOR UPDATE SKIP LOCKED
--   - Configuration pg_cron pour libération automatique
-- =============================================

-- =============================================
-- 1. CRÉER LA TABLE mission_disputes
-- =============================================

CREATE TABLE IF NOT EXISTS public.mission_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  mission_payment_id UUID NOT NULL REFERENCES public.mission_payments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'resolved', 'rejected')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  -- Colonnes pour disputes Stripe
  stripe_dispute_id TEXT UNIQUE,
  stripe_dispute_status TEXT,
  is_stripe_dispute BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour mission_disputes
CREATE INDEX IF NOT EXISTS idx_mission_disputes_mission_id 
  ON public.mission_disputes(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_disputes_payment_id 
  ON public.mission_disputes(mission_payment_id);
CREATE INDEX IF NOT EXISTS idx_mission_disputes_status 
  ON public.mission_disputes(status) 
  WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_mission_disputes_stripe_dispute_id 
  ON public.mission_disputes(stripe_dispute_id) 
  WHERE stripe_dispute_id IS NOT NULL;

COMMENT ON TABLE public.mission_disputes IS 
  'Litiges sur les paiements de missions (internes ou disputes Stripe)';
COMMENT ON COLUMN public.mission_disputes.is_stripe_dispute IS 
  'true si la dispute provient de Stripe (charge.dispute.created)';
COMMENT ON COLUMN public.mission_disputes.stripe_dispute_id IS 
  'ID de la dispute Stripe (dp_xxx) si applicable';

-- =============================================
-- 2. MODIFIER mission_payments
-- =============================================

-- Ajouter les colonnes nécessaires
ALTER TABLE public.mission_payments 
  ADD COLUMN IF NOT EXISTS has_dispute BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS problem_declared_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS release_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Index pour les requêtes du CRON
CREATE INDEX IF NOT EXISTS idx_mission_payments_release_at 
  ON public.mission_payments(release_at) 
  WHERE release_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mission_payments_released_at 
  ON public.mission_payments(released_at) 
  WHERE released_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mission_payments_has_dispute 
  ON public.mission_payments(has_dispute) 
  WHERE has_dispute = false;

-- Mettre à jour release_at pour les paiements existants
-- (basé sur end_date de la mission)
UPDATE public.mission_payments mp
SET release_at = m.end_date
FROM public.missions m
WHERE mp.mission_id = m.id
  AND mp.release_at IS NULL
  AND m.end_date IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN public.mission_payments.has_dispute IS 
  'true si un litige (interne ou Stripe) est en cours - bloque la libération automatique';
COMMENT ON COLUMN public.mission_payments.problem_declared_at IS 
  'Date de signalement d''un problème par le recruteur';
COMMENT ON COLUMN public.mission_payments.release_at IS 
  'Date prévue de libération des fonds (end_date de la mission)';
COMMENT ON COLUMN public.mission_payments.released_at IS 
  'Date effective de libération des fonds - SOURCE DE VÉRITÉ pour l''idempotence';

-- =============================================
-- 3. GARANTIR L'IDEMPOTENCE SUR mission_transfers
-- =============================================

-- stripe_transfer_id a déjà un UNIQUE, mais on s'assure qu'il est bien indexé
CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_transfers_stripe_transfer_id_unique 
  ON public.mission_transfers(stripe_transfer_id) 
  WHERE stripe_transfer_id IS NOT NULL;

-- =============================================
-- 4. FONCTION release_due_payments()
-- =============================================

CREATE OR REPLACE FUNCTION public.release_due_payments()
RETURNS TABLE(payment_id UUID, mission_id UUID, finance_id UUID, freelancer_id UUID, freelancer_amount INTEGER, commercial_id UUID, commercial_fee_amount INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH eligible_payments AS (
    SELECT 
      mp.id as payment_id,
      mp.mission_id,
      mf.id as finance_id,
      mf.freelancer_id,
      mf.freelancer_amount,
      mf.commercial_id,
      mf.commercial_fee_amount
    FROM public.mission_payments mp
    JOIN public.missions m ON m.id = mp.mission_id
    JOIN public.mission_finance mf ON mf.mission_payment_id = mp.id
    WHERE mp.status = 'received'
      AND mp.has_dispute = false
      AND mp.released_at IS NULL  -- Idempotence: jamais traité
      AND m.end_date <= CURRENT_DATE
      AND m.end_date IS NOT NULL
    FOR UPDATE SKIP LOCKED  -- Verrouillage: évite doubles traitements
  )
  SELECT 
    ep.payment_id,
    ep.mission_id,
    ep.finance_id,
    ep.freelancer_id,
    ep.freelancer_amount,
    ep.commercial_id,
    ep.commercial_fee_amount
  FROM eligible_payments ep;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.release_due_payments() IS 
  'Retourne les paiements éligibles pour libération automatique (end_date <= today, pas de litige, pas encore libéré). Utilise FOR UPDATE SKIP LOCKED pour éviter les doubles traitements.';

-- =============================================
-- 5. CONFIGURATION pg_cron (si disponible)
-- =============================================

-- Activer l'extension pg_cron (nécessite les droits superuser)
-- Note: Cette extension doit être activée manuellement par un admin Supabase
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Fonction pour appeler l'API Next.js via HTTP
-- Note: Nécessite l'extension pg_net ou net de Supabase
CREATE OR REPLACE FUNCTION public.call_release_payments_api()
RETURNS void AS $$
DECLARE
  api_url TEXT;
  api_secret TEXT;
  response_status INTEGER;
BEGIN
  -- Récupérer les variables d'environnement Supabase
  -- Note: Ces valeurs doivent être configurées dans Supabase Dashboard > Settings > Database > Custom Config
  api_url := current_setting('app.release_payments_api_url', true);
  api_secret := current_setting('app.cron_secret', true);

  -- Si les variables ne sont pas configurées, utiliser des valeurs par défaut
  IF api_url IS NULL THEN
    api_url := 'https://your-domain.com/api/cron/release-payments';
  END IF;

  IF api_secret IS NULL THEN
    RAISE WARNING 'CRON_SECRET non configuré. Le CRON ne pourra pas appeler l''API.';
    RETURN;
  END IF;

  -- Appeler l'endpoint Next.js via pg_net (extension Supabase)
  -- Note: Si pg_net n'est pas disponible, utiliser un service externe (GitHub Actions, etc.)
  BEGIN
    PERFORM net.http_post(
      url := api_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || api_secret
      ),
      body := '{}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erreur lors de l''appel API: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.call_release_payments_api() IS 
  'Appelle l''endpoint Next.js /api/cron/release-payments pour libérer les fonds. Nécessite pg_net et les variables app.release_payments_api_url et app.cron_secret.';

-- Programmer le CRON (nécessite pg_cron activé)
-- Note: Décommenter et adapter après activation de pg_cron
/*
SELECT cron.schedule(
  'release-payments-daily',
  '0 6 * * *',  -- Tous les jours à 6h00 UTC
  $$ SELECT public.call_release_payments_api(); $$
);
*/

-- =============================================
-- 6. TRIGGER: Mettre à jour release_at automatiquement
-- =============================================

-- Fonction trigger pour mettre à jour release_at quand end_date change
CREATE OR REPLACE FUNCTION public.update_payment_release_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour release_at pour tous les paiements de cette mission
  UPDATE public.mission_payments
  SET release_at = NEW.end_date
  WHERE mission_id = NEW.id
    AND released_at IS NULL  -- Ne pas modifier si déjà libéré
    AND (release_at IS NULL OR release_at != NEW.end_date);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_payment_release_at ON public.missions;
CREATE TRIGGER trigger_update_payment_release_at
  AFTER INSERT OR UPDATE OF end_date ON public.missions
  FOR EACH ROW
  WHEN (NEW.end_date IS NOT NULL)
  EXECUTE FUNCTION public.update_payment_release_at();

COMMENT ON FUNCTION public.update_payment_release_at() IS 
  'Met à jour automatiquement release_at des paiements quand end_date de la mission change';

-- =============================================
-- 7. VUE: Paiements en attente de libération
-- =============================================

DROP VIEW IF EXISTS public.payments_pending_release;
CREATE VIEW public.payments_pending_release AS
SELECT 
  mp.id as payment_id,
  mp.mission_id,
  mp.amount,
  mp.status,
  mp.has_dispute,
  mp.problem_declared_at,
  mp.release_at,
  mp.released_at,
  m.title as mission_title,
  m.end_date,
  m.recruiter_id,
  mf.id as finance_id,
  mf.freelancer_id,
  mf.freelancer_amount,
  mf.commercial_id,
  mf.commercial_fee_amount,
  mf.platform_net_amount,
  mf.stripe_fee_amount,
  pf.stripe_account_id as freelancer_stripe_account_id,
  pf.connect_payouts_enabled as freelancer_payouts_enabled,
  pc.stripe_account_id as commercial_stripe_account_id,
  pc.connect_payouts_enabled as commercial_payouts_enabled
FROM public.mission_payments mp
JOIN public.missions m ON m.id = mp.mission_id
LEFT JOIN public.mission_finance mf ON mf.mission_payment_id = mp.id
LEFT JOIN public.profiles pf ON pf.id = mf.freelancer_id
LEFT JOIN public.profiles pc ON pc.id = mf.commercial_id
WHERE mp.status = 'received'
  AND mp.released_at IS NULL;

COMMENT ON VIEW public.payments_pending_release IS 
  'Vue des paiements en attente de libération automatique (end_date <= today, pas de litige)';
