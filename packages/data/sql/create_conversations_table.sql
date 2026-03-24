-- =============================================
-- Table des conversations entre recruteur et freelance
-- =============================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Références
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  freelance_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_conversations_mission ON public.conversations(mission_id);
CREATE INDEX IF NOT EXISTS idx_conversations_recruiter ON public.conversations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_freelance ON public.conversations(freelance_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON public.conversations(created_at DESC);

-- Unicité des conversations liées à une mission
CREATE UNIQUE INDEX IF NOT EXISTS unique_conversation_with_mission
ON public.conversations (mission_id, recruiter_id, freelance_id)
WHERE mission_id IS NOT NULL;

-- Unicité des conversations directes (sans mission)
CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_conversation
ON public.conversations (recruiter_id, freelance_id)
WHERE mission_id IS NULL;

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================

-- Activer RLS sur la table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Rendre le script rejouable sans erreur
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs conversations" ON public.conversations;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs conversations" ON public.conversations;

-- Politique : Les utilisateurs peuvent voir les conversations où ils sont participant (recruteur OU freelance)
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (
  recruiter_id = auth.uid() OR freelance_id = auth.uid()
);

-- Politique : Les utilisateurs peuvent créer des conversations où ils sont participant
CREATE POLICY "Les utilisateurs peuvent créer leurs conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (
  recruiter_id = auth.uid() OR freelance_id = auth.uid()
);

-- =============================================
-- Commentaires
-- =============================================

COMMENT ON TABLE public.conversations IS 'Table contenant les conversations entre recruteurs et freelances, avec ou sans mission';
COMMENT ON COLUMN public.conversations.mission_id IS 'ID de la mission liée à la conversation (NULL pour conversation directe)';
COMMENT ON COLUMN public.conversations.recruiter_id IS 'ID du recruteur propriétaire de la mission';
COMMENT ON COLUMN public.conversations.freelance_id IS 'ID du freelance participant à la conversation';
