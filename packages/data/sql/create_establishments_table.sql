-- =============================================
-- Table des établissements (établissements recruteurs)
-- =============================================

CREATE TABLE IF NOT EXISTS public.establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  secret_code TEXT, -- Code secret lisible pour l'instant
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_establishments_owner ON public.establishments(owner_id);
CREATE INDEX IF NOT EXISTS idx_establishments_secret_code ON public.establishments(secret_code);

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================

-- Activer RLS sur la table
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- Politique : Les recruteurs (owners) peuvent voir leurs propres établissements
CREATE POLICY "Les recruteurs peuvent voir leurs établissements"
ON public.establishments FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Politique : Les recruteurs peuvent créer des établissements
CREATE POLICY "Les recruteurs peuvent créer des établissements"
ON public.establishments FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Politique : Les recruteurs peuvent modifier leurs propres établissements
CREATE POLICY "Les recruteurs peuvent modifier leurs établissements"
ON public.establishments FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Politique : Les recruteurs peuvent supprimer leurs propres établissements
CREATE POLICY "Les recruteurs peuvent supprimer leurs établissements"
ON public.establishments FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- TODO: policies commerciales
-- Les commerciaux pourront accéder aux établissements via le secret_code dans un 2ème temps

-- =============================================
-- Trigger pour mettre à jour updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_establishments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_establishments_updated_at
BEFORE UPDATE ON public.establishments
FOR EACH ROW
EXECUTE FUNCTION update_establishments_updated_at();

-- =============================================
-- Relation avec la table missions
-- =============================================

-- Ajouter la colonne establishment_id à la table missions (optionnel)
-- Cette colonne permet de lier une mission à un établissement
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES public.establishments(id) ON DELETE SET NULL;

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_missions_establishment ON public.missions(establishment_id);

-- =============================================
-- Commentaires
-- =============================================

COMMENT ON TABLE public.establishments IS 'Table contenant les établissements recruteurs';
COMMENT ON COLUMN public.establishments.owner_id IS 'ID du recruteur propriétaire de l''établissement';
COMMENT ON COLUMN public.establishments.secret_code IS 'Code secret permettant aux commerciaux d''accéder à l''établissement (à implémenter)';
COMMENT ON COLUMN public.missions.establishment_id IS 'ID de l''établissement associé à la mission (optionnel)';

