-- =============================================
-- Ajout des politiques RLS pour la suppression
-- des conversations et des messages
-- =============================================

-- =============================================
-- Politiques pour la table conversations
-- =============================================

-- Politique : Les utilisateurs peuvent supprimer les conversations où ils sont participant
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs conversations" ON public.conversations;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs conversations"
ON public.conversations FOR DELETE
TO authenticated
USING (
  recruiter_id = auth.uid() OR freelance_id = auth.uid()
);

-- =============================================
-- Politiques pour la table messages
-- =============================================

-- Politique : Les utilisateurs peuvent supprimer les messages des conversations auxquelles ils participent
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les messages de leurs conversations" ON public.messages;
CREATE POLICY "Les utilisateurs peuvent supprimer les messages de leurs conversations"
ON public.messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.recruiter_id = auth.uid() OR conversations.freelance_id = auth.uid())
  )
);

