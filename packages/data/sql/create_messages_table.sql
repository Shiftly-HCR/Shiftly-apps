-- =============================================
-- Table des messages dans les conversations
-- =============================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Référence à la conversation
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Référence à l'expéditeur
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contenu du message
  content TEXT NOT NULL,
  
  -- Statut de lecture (nullable, rempli quand le message est lu)
  read_at TIMESTAMPTZ
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at ASC);

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================

-- Activer RLS sur la table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les messages des conversations auxquelles ils participent
CREATE POLICY "Les utilisateurs peuvent voir les messages de leurs conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.recruiter_id = auth.uid() OR conversations.freelance_id = auth.uid())
  )
);

-- Politique : Les utilisateurs peuvent insérer des messages dans les conversations auxquelles ils participent
CREATE POLICY "Les utilisateurs peuvent envoyer des messages dans leurs conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.recruiter_id = auth.uid() OR conversations.freelance_id = auth.uid())
  )
);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres messages (pour read_at notamment)
CREATE POLICY "Les utilisateurs peuvent mettre à jour les messages de leurs conversations"
ON public.messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.recruiter_id = auth.uid() OR conversations.freelance_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.recruiter_id = auth.uid() OR conversations.freelance_id = auth.uid())
  )
);

-- =============================================
-- Commentaires
-- =============================================

COMMENT ON TABLE public.messages IS 'Table contenant les messages échangés dans les conversations';
COMMENT ON COLUMN public.messages.conversation_id IS 'ID de la conversation à laquelle appartient le message';
COMMENT ON COLUMN public.messages.sender_id IS 'ID de l''utilisateur qui a envoyé le message';
COMMENT ON COLUMN public.messages.content IS 'Contenu textuel du message';
COMMENT ON COLUMN public.messages.read_at IS 'Date et heure à laquelle le message a été lu (NULL si non lu)';

