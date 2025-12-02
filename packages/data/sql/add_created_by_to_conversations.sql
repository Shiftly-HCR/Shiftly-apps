-- =============================================
-- Ajouter le champ created_by à la table conversations
-- =============================================

-- Ajouter la colonne created_by
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);

-- Commentaire
COMMENT ON COLUMN public.conversations.created_by IS 'ID de l''utilisateur qui a créé la conversation (peut être le recruteur ou le freelance)';

