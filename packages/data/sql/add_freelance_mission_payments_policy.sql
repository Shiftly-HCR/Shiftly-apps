-- =============================================
-- Ajouter une politique RLS pour que le freelance puisse voir les paiements
-- de missions où il est le candidat accepté
-- =============================================

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Freelance can view mission payments where accepted" ON public.mission_payments;

-- Le freelance peut voir les paiements des missions où il est le candidat accepté
CREATE POLICY "Freelance can view mission payments where accepted"
  ON public.mission_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mission_applications ma
      WHERE ma.mission_id = mission_id
        AND ma.user_id = auth.uid()
        AND ma.status = 'accepted'
    )
  );

-- Vérification : Afficher les politiques de la table
-- SELECT * FROM pg_policies WHERE tablename = 'mission_payments';
