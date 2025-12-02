-- =============================================
-- Politique RLS pour permettre la lecture publique des établissements
-- liés à des missions publiées
-- =============================================

-- Cette politique permet à tous les utilisateurs authentifiés de voir
-- un établissement s'il est lié à au moins une mission publiée
CREATE POLICY "Les utilisateurs peuvent voir les établissements liés à des missions publiées"
ON public.establishments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.missions
    WHERE missions.establishment_id = establishments.id
      AND missions.status = 'published'
  )
);

