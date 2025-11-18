-- =============================================
-- Table des missions
-- =============================================

CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Référence au recruteur (profile)
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations générales
  title TEXT NOT NULL,
  description TEXT,
  
  -- Compétences requises
  skills TEXT[], -- Array de compétences (ex: ["Serveur", "Barman"])
  
  -- Localisation
  address TEXT,
  city TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Dates et horaires
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  
  -- Rémunération
  hourly_rate DECIMAL(10, 2), -- Taux horaire en euros
  currency TEXT DEFAULT 'EUR',
  
  -- Image de la mission
  image_url TEXT,
  
  -- Statut
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'cancelled')),
  
  -- Métadonnées
  is_urgent BOOLEAN DEFAULT FALSE,
  total_positions INTEGER DEFAULT 1, -- Nombre de postes à pourvoir
  filled_positions INTEGER DEFAULT 0 -- Nombre de postes pourvus
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_missions_recruiter ON public.missions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_start_date ON public.missions(start_date);
CREATE INDEX IF NOT EXISTS idx_missions_city ON public.missions(city);

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================

-- Activer RLS sur la table
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Politique : Les recruteurs peuvent voir leurs propres missions
CREATE POLICY "Les recruteurs peuvent voir leurs missions"
ON public.missions FOR SELECT
TO authenticated
USING (recruiter_id = auth.uid());

-- Politique : Les recruteurs peuvent créer des missions
CREATE POLICY "Les recruteurs peuvent créer des missions"
ON public.missions FOR INSERT
TO authenticated
WITH CHECK (recruiter_id = auth.uid());

-- Politique : Les recruteurs peuvent modifier leurs propres missions
CREATE POLICY "Les recruteurs peuvent modifier leurs missions"
ON public.missions FOR UPDATE
TO authenticated
USING (recruiter_id = auth.uid())
WITH CHECK (recruiter_id = auth.uid());

-- Politique : Les recruteurs peuvent supprimer leurs propres missions
CREATE POLICY "Les recruteurs peuvent supprimer leurs missions"
ON public.missions FOR DELETE
TO authenticated
USING (recruiter_id = auth.uid());

-- Politique : Tout le monde peut voir les missions publiées (pour les freelances)
CREATE POLICY "Tout le monde peut voir les missions publiées"
ON public.missions FOR SELECT
TO public
USING (status = 'published');

-- =============================================
-- Trigger pour mettre à jour updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_missions_updated_at
BEFORE UPDATE ON public.missions
FOR EACH ROW
EXECUTE FUNCTION update_missions_updated_at();

-- =============================================
-- Commentaires
-- =============================================

COMMENT ON TABLE public.missions IS 'Table contenant toutes les missions créées par les recruteurs';
COMMENT ON COLUMN public.missions.recruiter_id IS 'ID du recruteur qui a créé la mission';
COMMENT ON COLUMN public.missions.status IS 'Statut de la mission: draft (brouillon), published (publiée), closed (fermée), cancelled (annulée)';
COMMENT ON COLUMN public.missions.is_urgent IS 'Indique si la mission est urgente';
COMMENT ON COLUMN public.missions.total_positions IS 'Nombre total de postes à pourvoir';
COMMENT ON COLUMN public.missions.filled_positions IS 'Nombre de postes déjà pourvus';

