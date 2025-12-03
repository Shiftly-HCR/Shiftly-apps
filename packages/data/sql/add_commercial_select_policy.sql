-- =============================================
-- Politique RLS pour permettre aux commerciaux de voir tous les établissements
-- =============================================

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Les commerciaux peuvent voir tous les établissements" ON public.establishments;

-- Politique : Les commerciaux peuvent voir tous les établissements
-- Cette politique permet aux commerciaux de voir la liste des établissements disponibles
-- pour se rattacher via le code secret
CREATE POLICY "Les commerciaux peuvent voir tous les établissements"
ON public.establishments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'commercial'
  )
);

