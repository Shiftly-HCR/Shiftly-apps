-- =============================================
-- Table des candidatures aux missions
-- =============================================

CREATE TABLE IF NOT EXISTS public.mission_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Références
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Statut de la candidature
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'accepted', 'withdrawn')),
  
  -- Message de motivation optionnel
  cover_letter TEXT,
  
  -- Contrainte d'unicité : un freelance ne peut postuler qu'une fois à une mission
  CONSTRAINT unique_mission_user UNIQUE (mission_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mission_applications_mission ON public.mission_applications(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_applications_user ON public.mission_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_applications_status ON public.mission_applications(status);
CREATE INDEX IF NOT EXISTS idx_mission_applications_created ON public.mission_applications(created_at DESC);

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================

-- Activer RLS sur la table
ALTER TABLE public.mission_applications ENABLE ROW LEVEL SECURITY;

-- Politique : Les freelances peuvent voir leurs propres candidatures
CREATE POLICY "Les freelances peuvent voir leurs candidatures"
ON public.mission_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Politique : Les recruteurs peuvent voir les candidatures de leurs missions
CREATE POLICY "Les recruteurs peuvent voir les candidatures de leurs missions"
ON public.mission_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.missions
    WHERE missions.id = mission_applications.mission_id
    AND missions.recruiter_id = auth.uid()
  )
);

-- Politique : Les freelances peuvent créer leurs propres candidatures
CREATE POLICY "Les freelances peuvent créer leurs candidatures"
ON public.mission_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Politique : Les freelances peuvent modifier leurs propres candidatures (pour retirer ou mettre à jour)
CREATE POLICY "Les freelances peuvent modifier leurs candidatures"
ON public.mission_applications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Politique : Les recruteurs peuvent modifier le statut des candidatures de leurs missions
CREATE POLICY "Les recruteurs peuvent modifier le statut des candidatures"
ON public.mission_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.missions
    WHERE missions.id = mission_applications.mission_id
    AND missions.recruiter_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.missions
    WHERE missions.id = mission_applications.mission_id
    AND missions.recruiter_id = auth.uid()
  )
);

-- =============================================
-- Trigger pour mettre à jour updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_mission_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mission_applications_updated_at
BEFORE UPDATE ON public.mission_applications
FOR EACH ROW
EXECUTE FUNCTION update_mission_applications_updated_at();

-- =============================================
-- Commentaires
-- =============================================

COMMENT ON TABLE public.mission_applications IS 'Table contenant toutes les candidatures des freelances aux missions';
COMMENT ON COLUMN public.mission_applications.mission_id IS 'ID de la mission à laquelle le freelance postule';
COMMENT ON COLUMN public.mission_applications.user_id IS 'ID du freelance qui postule';
COMMENT ON COLUMN public.mission_applications.status IS 'Statut de la candidature: applied (candidature envoyée), shortlisted (présélectionné), rejected (refusé), accepted (accepté), withdrawn (retiré)';
COMMENT ON COLUMN public.mission_applications.cover_letter IS 'Message de motivation optionnel du freelance';

