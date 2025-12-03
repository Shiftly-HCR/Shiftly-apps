-- =============================================
-- Politique RLS pour permettre aux commerciaux de mettre à jour commercial_id
-- =============================================

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Les commerciaux peuvent mettre à jour commercial_id" ON public.establishments;

-- Politique : Les commerciaux peuvent mettre à jour le champ commercial_id des établissements
-- Cette politique permet aux commerciaux de se rattacher à un établissement via le code secret
-- Note: Cette politique permet aux commerciaux de mettre à jour uniquement les établissements
-- qui n'ont pas encore de commercial_id
-- 
-- IMPORTANT: Dans PostgreSQL RLS, NEW et OLD ne sont pas disponibles dans les politiques
-- On utilise donc les colonnes directement (sans préfixe NEW/OLD)
-- Dans USING, on vérifie l'état actuel de la ligne
-- Dans WITH CHECK, on vérifie les nouvelles valeurs
CREATE POLICY "Les commerciaux peuvent mettre à jour commercial_id"
ON public.establishments FOR UPDATE
TO authenticated
USING (
  -- Permettre si l'utilisateur est un commercial
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'commercial'
  )
  -- Vérifier que l'établissement n'a pas encore de commercial_id
  -- (on référence directement la colonne commercial_id de la ligne actuelle)
  AND commercial_id IS NULL
)
WITH CHECK (
  -- Vérifier que l'utilisateur est bien un commercial
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'commercial'
  )
  -- Vérifier que commercial_id est bien défini et correspond à l'utilisateur courant
  -- (on référence directement la colonne commercial_id de la nouvelle ligne)
  AND commercial_id = auth.uid()
);

