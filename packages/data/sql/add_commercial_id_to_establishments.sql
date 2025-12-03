-- =============================================
-- Ajout de la colonne commercial_id à la table establishments
-- =============================================

-- Ajouter la colonne commercial_id (optionnel, peut être NULL)
ALTER TABLE public.establishments
ADD COLUMN IF NOT EXISTS commercial_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_establishments_commercial ON public.establishments(commercial_id);

-- Commentaire
COMMENT ON COLUMN public.establishments.commercial_id IS 'ID du commercial rattaché à cet établissement (optionnel)';

