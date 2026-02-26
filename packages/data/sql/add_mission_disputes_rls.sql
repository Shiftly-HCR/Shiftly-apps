-- Migration: Activer le RLS sur mission_disputes et définir les politiques d'accès
-- Date: 2026-02-26
-- Description:
--   - Active le Row Level Security sur public.mission_disputes
--   - Freelance/Commercial : lecture des litiges liés à leurs paiements
--   - Recruteur : lecture des litiges liés à ses missions
--   - Admin : lecture et mise à jour de tous les litiges
--   - Service role : bypass automatique (pas de policy nécessaire)
--
-- IMPORTANT: Exécuter add_admin_role_to_profiles.sql avant cette migration
--            pour que le rôle "admin" soit valide dans la contrainte CHECK.

-- ============================================================
-- 1. ACTIVER RLS
-- ============================================================

ALTER TABLE public.mission_disputes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. SUPPRIMER LES POLITIQUES EXISTANTES (idempotence)
-- ============================================================

DROP POLICY IF EXISTS "Freelance or commercial can view their disputes" ON public.mission_disputes;
DROP POLICY IF EXISTS "Recruiter can view disputes on their missions"    ON public.mission_disputes;
DROP POLICY IF EXISTS "Admin can view all disputes"                      ON public.mission_disputes;
DROP POLICY IF EXISTS "Admin can update disputes"                        ON public.mission_disputes;

-- ============================================================
-- 3. POLITIQUES SELECT
-- ============================================================

-- Le freelance et le commercial peuvent voir les litiges liés
-- à des paiements de missions sur lesquelles ils sont impliqués.
CREATE POLICY "Freelance or commercial can view their disputes"
  ON public.mission_disputes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mission_finance mf
      WHERE mf.mission_payment_id = mission_disputes.mission_payment_id
        AND (mf.freelancer_id = auth.uid() OR mf.commercial_id = auth.uid())
    )
  );

-- Le recruteur peut voir les litiges liés à ses missions.
CREATE POLICY "Recruiter can view disputes on their missions"
  ON public.mission_disputes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = mission_disputes.mission_id
        AND m.recruiter_id = auth.uid()
    )
  );

-- L'admin peut voir tous les litiges.
CREATE POLICY "Admin can view all disputes"
  ON public.mission_disputes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- ============================================================
-- 4. POLITIQUE UPDATE (admin uniquement)
-- ============================================================

-- L'admin peut mettre à jour les litiges (résolution, rejet).
-- Les mutations sont faites via l'API /api/admin/disputes/[id]/resolve
-- qui utilise le service role ; cette policy reste en place pour
-- permettre les mises à jour directes si besoin d'urgence.
CREATE POLICY "Admin can update disputes"
  ON public.mission_disputes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

COMMENT ON TABLE public.mission_disputes IS
  'Litiges sur les paiements de missions (internes ou disputes Stripe). RLS activé.';
