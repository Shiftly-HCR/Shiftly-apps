-- =============================================
-- Migration: Mise à jour des statuts de mission_payments
-- Date: 2026-01-17
-- Description: 
--   - 'pending': paiement en attente
--   - 'received': paiement reçu par Stripe, fonds en attente de distribution
--   - 'distributed': commissions et salaire distribués
--   - 'errored': erreur lors de la distribution (après 3 retry)
--   - 'failed': échec de paiement initial
--   - 'refunded': remboursé
-- =============================================

-- 1. Modifier la contrainte CHECK pour inclure les nouveaux statuts
ALTER TABLE public.mission_payments 
  DROP CONSTRAINT IF EXISTS mission_payments_status_check;

ALTER TABLE public.mission_payments 
  ADD CONSTRAINT mission_payments_status_check 
  CHECK (status IN ('pending', 'paid', 'received', 'distributed', 'errored', 'failed', 'refunded', 'released'));

-- 2. Migrer les données existantes: 'paid' -> 'received'
UPDATE public.mission_payments 
  SET status = 'received' 
  WHERE status = 'paid';

-- 3. Ajouter une colonne pour la date de distribution
ALTER TABLE public.mission_payments 
  ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMPTZ;

-- 4. Créer un index pour les paiements à distribuer
CREATE INDEX IF NOT EXISTS idx_mission_payments_received_status 
  ON public.mission_payments(status) 
  WHERE status = 'received';

-- 5. Mettre à jour les commentaires
COMMENT ON COLUMN public.mission_payments.status IS 
  'Statut: pending (en attente), received (paiement reçu), distributed (fonds distribués), errored (échec distribution), failed (échec paiement), refunded (remboursé)';
COMMENT ON COLUMN public.mission_payments.distributed_at IS 
  'Date de distribution des fonds aux destinataires (freelance, commercial)';

-- =============================================
-- Vue: Paiements prêts à être distribués
-- (missions dont la end_date est passée et status = received)
-- =============================================
DROP VIEW IF EXISTS public.payments_ready_for_distribution;
CREATE VIEW public.payments_ready_for_distribution AS
SELECT 
  mp.id as payment_id,
  mp.mission_id,
  mp.amount,
  mp.status,
  mp.paid_at,
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
WHERE mp.status = 'received';

COMMENT ON VIEW public.payments_ready_for_distribution IS 
  'Vue des paiements en statut received prêts à être distribués par le recruteur';
