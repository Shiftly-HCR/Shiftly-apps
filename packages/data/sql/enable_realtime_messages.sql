-- =============================================
-- Activation du Realtime pour la table messages
-- =============================================

-- Activer la publication realtime pour la table messages
-- Cela permet aux clients d'écouter les changements en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Configurer REPLICA IDENTITY pour permettre le realtime sur DELETE
-- Cela permet à Supabase de suivre les changements même lors de la suppression
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Les politiques RLS existantes permettent déjà aux utilisateurs de :
-- - Voir les messages de leurs conversations (SELECT)
-- - Envoyer des messages dans leurs conversations (INSERT)
-- - Mettre à jour les messages de leurs conversations (UPDATE)
-- - Supprimer les messages de leurs conversations (DELETE)
-- 
-- Le realtime respectera automatiquement ces politiques RLS,
-- donc les utilisateurs ne recevront que les événements pour
-- les messages des conversations auxquelles ils participent.

