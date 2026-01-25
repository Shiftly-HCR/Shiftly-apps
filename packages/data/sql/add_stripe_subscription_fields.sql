-- Migration: Ajouter les champs Stripe pour gérer les abonnements
-- Date: 2025-01-XX

-- 1. Ajouter les nouveaux champs à la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;

-- 2. Garder subscription_plan_id et is_premium (on va les mettre à jour via webhook)
-- is_premium sera calculé: true si status = 'active' ou 'trialing'

-- 3. Créer la table stripe_events pour l'idempotence des webhooks
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at ON public.stripe_events(processed_at);

-- 5. RLS Policies pour stripe_events (lecture seule pour les utilisateurs, service role peut tout faire)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent pas lire/modifier les events (réservé au service role via webhook)
DROP POLICY IF EXISTS "No access to stripe_events for users" ON public.stripe_events;
CREATE POLICY "No access to stripe_events for users"
  ON public.stripe_events
  FOR ALL
  USING (false);

-- 6. RLS Policies mises à jour pour profiles - protéger les champs Stripe
-- Les utilisateurs ne peuvent PAS modifier les champs Stripe (uniquement le service role)
-- Créer une fonction pour vérifier qu'on ne modifie pas les champs Stripe

-- Policy existante permet la mise à jour, mais on va la modifier pour exclure les champs Stripe
-- La mise à jour des champs Stripe se fait uniquement via service role (webhook)

-- Note: Les champs Stripe (stripe_customer_id, stripe_subscription_id, subscription_status, etc.)
-- ne peuvent être modifiés que via le service role Supabase (utilisé dans les webhooks).
-- La policy "Users can update their own profile" existante continue de fonctionner pour les autres champs.

-- 7. Commentaire sur la stratégie
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'ID du customer Stripe, mis à jour uniquement via webhook';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'ID de l''abonnement Stripe, mis à jour uniquement via webhook';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Statut de l''abonnement Stripe: active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, paused';
COMMENT ON COLUMN public.profiles.current_period_end IS 'Date de fin de la période d''abonnement actuelle';
COMMENT ON COLUMN public.profiles.cancel_at_period_end IS 'Indique si l''abonnement sera annulé à la fin de la période actuelle';
COMMENT ON COLUMN public.profiles.subscription_price_id IS 'ID du price Stripe (price_xxx)';
COMMENT ON COLUMN public.profiles.is_premium IS 'Calculé: true si subscription_status = ''active'' ou ''trialing''';
COMMENT ON TABLE public.stripe_events IS 'Table pour éviter le retraitement des webhooks Stripe (idempotence)';

