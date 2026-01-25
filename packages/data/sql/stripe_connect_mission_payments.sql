-- Migration: Stripe Connect + Paiements de Missions
-- Date: 2025-01-XX
-- Description: Ajoute le support Stripe Connect Express pour freelances/commerciaux
--              et le système de paiements de missions avec distribution des fonds

-- ============================================================================
-- ÉTAPE 1: MODIFIER LA TABLE PROFILES POUR STRIPE CONNECT
-- ============================================================================

-- 1.1 Ajouter les champs Stripe Connect à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS connect_onboarding_status TEXT DEFAULT 'not_started' 
  CHECK (connect_onboarding_status IN ('not_started', 'pending', 'complete')),
ADD COLUMN IF NOT EXISTS connect_payouts_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS connect_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS connect_requirements_due JSONB NULL;

-- 1.2 Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account_id ON public.profiles(stripe_account_id);

-- 1.3 Commentaires
COMMENT ON COLUMN public.profiles.stripe_account_id IS 'ID du compte Stripe Connect Express (acct_xxx)';
COMMENT ON COLUMN public.profiles.connect_onboarding_status IS 'État de l''onboarding Connect: not_started, pending, complete';
COMMENT ON COLUMN public.profiles.connect_payouts_enabled IS 'Indique si le compte peut recevoir des virements';
COMMENT ON COLUMN public.profiles.connect_charges_enabled IS 'Indique si le compte peut recevoir des paiements';
COMMENT ON COLUMN public.profiles.connect_requirements_due IS 'Exigences en attente pour compléter l''onboarding';

-- ============================================================================
-- ÉTAPE 2: CRÉER LA TABLE MISSION_PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mission_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0), -- Montant en centimes
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_mission_payments_mission_id ON public.mission_payments(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_payments_recruiter_id ON public.mission_payments(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_mission_payments_status ON public.mission_payments(status);
CREATE INDEX IF NOT EXISTS idx_mission_payments_checkout_session ON public.mission_payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_mission_payments_payment_intent ON public.mission_payments(stripe_payment_intent_id);

COMMENT ON TABLE public.mission_payments IS 'Paiements des missions via Stripe Checkout';
COMMENT ON COLUMN public.mission_payments.amount IS 'Montant en centimes (EUR par défaut)';

-- ============================================================================
-- ÉTAPE 3: CRÉER LA TABLE MISSION_FINANCE (snapshot des montants)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mission_finance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  mission_payment_id UUID NOT NULL REFERENCES public.mission_payments(id) ON DELETE CASCADE,
  gross_amount INTEGER NOT NULL CHECK (gross_amount > 0), -- Montant brut en centimes
  platform_fee_amount INTEGER NOT NULL CHECK (platform_fee_amount >= 0), -- Part plateforme totale (15%)
  commercial_fee_amount INTEGER NOT NULL DEFAULT 0 CHECK (commercial_fee_amount >= 0), -- Part commercial (6% si applicable)
  freelancer_amount INTEGER NOT NULL CHECK (freelancer_amount >= 0), -- Part freelance (85%)
  platform_net_amount INTEGER NOT NULL CHECK (platform_net_amount >= 0), -- Part nette plateforme (15% ou 9% si commercial)
  commercial_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Commercial rattaché (si applicable)
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Freelance affecté à la mission
  status TEXT NOT NULL DEFAULT 'calculated'
    CHECK (status IN ('calculated', 'funds_released', 'partially_released')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_mission_finance_mission_id ON public.mission_finance(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_finance_payment_id ON public.mission_finance(mission_payment_id);
CREATE INDEX IF NOT EXISTS idx_mission_finance_commercial_id ON public.mission_finance(commercial_id);
CREATE INDEX IF NOT EXISTS idx_mission_finance_freelancer_id ON public.mission_finance(freelancer_id);

COMMENT ON TABLE public.mission_finance IS 'Snapshot des répartitions financières pour chaque paiement de mission';
COMMENT ON COLUMN public.mission_finance.gross_amount IS 'Montant brut payé par le recruteur (en centimes)';
COMMENT ON COLUMN public.mission_finance.platform_fee_amount IS 'Commission totale plateforme: 15% du montant brut';
COMMENT ON COLUMN public.mission_finance.commercial_fee_amount IS 'Commission commercial: 6% si établissement rattaché, sinon 0';
COMMENT ON COLUMN public.mission_finance.freelancer_amount IS 'Part versée au freelance: 85% du montant brut';
COMMENT ON COLUMN public.mission_finance.platform_net_amount IS 'Part nette plateforme: 15% - 6% commercial = 9% si commercial, sinon 15%';

-- ============================================================================
-- ÉTAPE 4: CRÉER LA TABLE MISSION_TRANSFERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mission_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  mission_payment_id UUID NOT NULL REFERENCES public.mission_payments(id) ON DELETE CASCADE,
  mission_finance_id UUID REFERENCES public.mission_finance(id) ON DELETE SET NULL,
  destination_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination_stripe_account_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('freelancer_payout', 'commercial_commission')),
  amount INTEGER NOT NULL CHECK (amount > 0), -- Montant en centimes
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'created', 'failed', 'reversed')),
  stripe_transfer_id TEXT UNIQUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  transferred_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_mission_transfers_mission_id ON public.mission_transfers(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_transfers_payment_id ON public.mission_transfers(mission_payment_id);
CREATE INDEX IF NOT EXISTS idx_mission_transfers_destination_profile ON public.mission_transfers(destination_profile_id);
CREATE INDEX IF NOT EXISTS idx_mission_transfers_status ON public.mission_transfers(status);
CREATE INDEX IF NOT EXISTS idx_mission_transfers_type ON public.mission_transfers(type);

COMMENT ON TABLE public.mission_transfers IS 'Transferts Stripe vers les comptes Connect (freelances et commerciaux)';
COMMENT ON COLUMN public.mission_transfers.type IS 'Type de transfert: freelancer_payout (85%) ou commercial_commission (6%)';

-- ============================================================================
-- ÉTAPE 5: AMÉLIORER LA TABLE STRIPE_EVENTS
-- ============================================================================

-- 5.1 Ajouter les colonnes manquantes
ALTER TABLE public.stripe_events
ADD COLUMN IF NOT EXISTS livemode BOOLEAN,
ADD COLUMN IF NOT EXISTS payload JSONB;

-- 5.2 S'assurer que event_id est unique (normalement déjà PK)
-- Note: event_id est déjà la clé primaire, donc unique par définition

-- 5.3 Index pour le mode live
CREATE INDEX IF NOT EXISTS idx_stripe_events_livemode ON public.stripe_events(livemode);

COMMENT ON COLUMN public.stripe_events.livemode IS 'true si l''événement provient du mode production Stripe';
COMMENT ON COLUMN public.stripe_events.payload IS 'Payload complet de l''événement (optionnel, pour debug)';

-- ============================================================================
-- ÉTAPE 6: RLS POLICIES POUR LES NOUVELLES TABLES
-- ============================================================================

-- 6.1 MISSION_PAYMENTS RLS
ALTER TABLE public.mission_payments ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Recruiter can view their mission payments" ON public.mission_payments;
DROP POLICY IF EXISTS "Admin can view all mission payments" ON public.mission_payments;
DROP POLICY IF EXISTS "Service role can manage mission payments" ON public.mission_payments;

-- Le recruteur peut voir les paiements de ses missions
CREATE POLICY "Recruiter can view their mission payments"
  ON public.mission_payments
  FOR SELECT
  USING (
    recruiter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.missions m 
      WHERE m.id = mission_id AND m.recruiter_id = auth.uid()
    )
  );

-- Note: Insert/Update/Delete réservés au service role (via webhooks et API backend)

-- 6.2 MISSION_FINANCE RLS
ALTER TABLE public.mission_finance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Commercial can view their finance records" ON public.mission_finance;
DROP POLICY IF EXISTS "Freelancer can view their finance records" ON public.mission_finance;
DROP POLICY IF EXISTS "Recruiter can view mission finance" ON public.mission_finance;

-- Le commercial peut voir les finances où il est impliqué
CREATE POLICY "Commercial can view their finance records"
  ON public.mission_finance
  FOR SELECT
  USING (commercial_id = auth.uid());

-- Le freelance peut voir les finances où il est impliqué
CREATE POLICY "Freelancer can view their finance records"
  ON public.mission_finance
  FOR SELECT
  USING (freelancer_id = auth.uid());

-- Le recruteur peut voir les finances de ses missions
CREATE POLICY "Recruiter can view mission finance"
  ON public.mission_finance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missions m 
      WHERE m.id = mission_id AND m.recruiter_id = auth.uid()
    )
  );

-- 6.3 MISSION_TRANSFERS RLS
ALTER TABLE public.mission_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view their transfers" ON public.mission_transfers;
DROP POLICY IF EXISTS "Recruiter can view mission transfers" ON public.mission_transfers;

-- L'utilisateur peut voir les transferts où il est destinataire
CREATE POLICY "User can view their transfers"
  ON public.mission_transfers
  FOR SELECT
  USING (destination_profile_id = auth.uid());

-- Le recruteur peut voir les transferts liés à ses missions
CREATE POLICY "Recruiter can view mission transfers"
  ON public.mission_transfers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missions m 
      WHERE m.id = mission_id AND m.recruiter_id = auth.uid()
    )
  );

-- 6.4 MISE À JOUR PROFILES: Protéger les champs Connect
-- Les utilisateurs peuvent lire leurs propres champs Connect mais pas les modifier
-- (les modifications se font via service role dans les webhooks)

-- Note: La policy existante "Users can update their own profile" permet la mise à jour
-- Pour les champs Connect, seul le service role peut les modifier via webhooks

-- ============================================================================
-- ÉTAPE 7: TRIGGER POUR UPDATED_AT
-- ============================================================================

-- Créer une fonction générique pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à mission_payments
DROP TRIGGER IF EXISTS set_updated_at_mission_payments ON public.mission_payments;
CREATE TRIGGER set_updated_at_mission_payments
  BEFORE UPDATE ON public.mission_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================================================
-- ÉTAPE 8: VUES UTILES POUR LE DASHBOARD COMMERCIAL
-- ============================================================================

-- Vue pour les statistiques du commercial
CREATE OR REPLACE VIEW public.commercial_stats AS
SELECT 
  p.id as commercial_id,
  COUNT(DISTINCT e.id) as total_establishments,
  COUNT(DISTINCT mf.mission_id) as total_missions_with_commission,
  COALESCE(SUM(mf.commercial_fee_amount), 0) as total_commission_earned,
  COALESCE(SUM(CASE WHEN mt.status = 'created' THEN mt.amount ELSE 0 END), 0) as total_commission_paid
FROM public.profiles p
LEFT JOIN public.establishments e ON e.commercial_id = p.id
LEFT JOIN public.missions m ON m.establishment_id = e.id
LEFT JOIN public.mission_finance mf ON mf.mission_id = m.id AND mf.commercial_id = p.id
LEFT JOIN public.mission_transfers mt ON mt.destination_profile_id = p.id AND mt.type = 'commercial_commission'
WHERE p.role = 'commercial'
GROUP BY p.id;

COMMENT ON VIEW public.commercial_stats IS 'Statistiques agrégées pour les commerciaux (établissements, commissions)';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
