-- Migration: Protéger les champs Stripe dans profiles via RLS
-- Date: 2025-01-XX
-- Description: Empêche les utilisateurs de modifier les champs Stripe directement
--              Seul le service role (via webhooks) peut modifier ces champs

-- 1. Supprimer l'ancienne policy de mise à jour qui permettait de tout modifier
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Créer une nouvelle policy qui permet la mise à jour seulement des champs non-Stripe
-- Les utilisateurs peuvent mettre à jour: first_name, last_name, email, phone, bio, photo_url
-- Mais PAS: stripe_customer_id, stripe_subscription_id, subscription_status, etc.
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Empêcher la modification des champs Stripe
    AND (
      stripe_customer_id IS NULL OR stripe_customer_id = (SELECT stripe_customer_id FROM public.profiles WHERE id = auth.uid())
    )
    AND (
      stripe_subscription_id IS NULL OR stripe_subscription_id = (SELECT stripe_subscription_id FROM public.profiles WHERE id = auth.uid())
    )
    AND (
      subscription_status IS NULL OR subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
    )
    AND (
      current_period_end IS NULL OR current_period_end = (SELECT current_period_end FROM public.profiles WHERE id = auth.uid())
    )
    AND (
      cancel_at_period_end IS NULL OR cancel_at_period_end = (SELECT cancel_at_period_end FROM public.profiles WHERE id = auth.uid())
    )
    AND (
      subscription_price_id IS NULL OR subscription_price_id = (SELECT subscription_price_id FROM public.profiles WHERE id = auth.uid())
    )
    -- is_premium est calculé automatiquement, mais on peut le laisser modifiable par l'utilisateur
    -- pour compatibilité avec l'ancien système (mais les webhooks le mettront à jour aussi)
  );

-- 3. Alternative plus simple: Créer une fonction trigger qui bloque les modifications Stripe
-- Cette approche est plus robuste car elle vérifie au niveau de la base de données

CREATE OR REPLACE FUNCTION public.prevent_stripe_fields_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur tente de modifier un champ Stripe, lever une erreur
  -- Sauf si c'est le service role (pour les webhooks)
  IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    IF (
      OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id OR
      OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id OR
      OLD.subscription_status IS DISTINCT FROM NEW.subscription_status OR
      OLD.current_period_end IS DISTINCT FROM NEW.current_period_end OR
      OLD.cancel_at_period_end IS DISTINCT FROM NEW.cancel_at_period_end OR
      OLD.subscription_price_id IS DISTINCT FROM NEW.subscription_price_id
    ) THEN
      RAISE EXCEPTION 'Les champs Stripe ne peuvent pas être modifiés directement. Contactez le support.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS prevent_stripe_fields_update_trigger ON public.profiles;

-- Créer le trigger
CREATE TRIGGER prevent_stripe_fields_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_stripe_fields_update();

-- 4. Commentaires
COMMENT ON FUNCTION public.prevent_stripe_fields_update() IS 
  'Empêche la modification des champs Stripe par les utilisateurs. Seul le service role (webhooks) peut modifier ces champs.';

