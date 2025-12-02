-- =============================================
-- Activation du Realtime pour la table conversations
-- =============================================

-- IMPORTANT : Avant d'exécuter ce script, assurez-vous que :
-- 1. La table conversations existe (voir create_conversations_table.sql)
-- 2. Les politiques RLS sont activées (voir create_conversations_table.sql)
-- 3. Les politiques DELETE sont activées (voir add_delete_policies_conversations_messages.sql)

-- Activer la publication realtime pour la table conversations
-- Cela permet aux clients d'écouter les changements en temps réel
-- Note : Si la table est déjà dans la publication, cette commande échouera silencieusement
DO $$
BEGIN
  -- Vérifier si la table est déjà dans la publication
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    RAISE NOTICE 'Table conversations ajoutée à la publication realtime';
  ELSE
    RAISE NOTICE 'Table conversations déjà dans la publication realtime';
  END IF;
END $$;

-- Configurer REPLICA IDENTITY pour permettre le realtime sur DELETE
-- Cela permet à Supabase de suivre les changements même lors de la suppression
-- FULL permet de répliquer toutes les colonnes lors d'une suppression
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- =============================================
-- Vérification des politiques RLS
-- =============================================

-- Les politiques RLS suivantes doivent exister pour que le realtime fonctionne correctement :
-- 
-- SELECT : Les utilisateurs peuvent voir leurs conversations
--   (voir create_conversations_table.sql)
--
-- INSERT : Les utilisateurs peuvent créer leurs conversations
--   (voir create_conversations_table.sql)
--
-- DELETE : Les utilisateurs peuvent supprimer leurs conversations
--   (voir add_delete_policies_conversations_messages.sql)
--
-- Le realtime respectera automatiquement ces politiques RLS,
-- donc les utilisateurs ne recevront que les événements pour
-- les conversations où ils sont participants (recruiter_id OU freelance_id = auth.uid()).

-- =============================================
-- Notes importantes
-- =============================================

-- 1. Activation dans le Dashboard Supabase :
--    - Allez dans Database > Replication
--    - Activez le realtime pour la table "conversations"
--    - Ou utilisez l'API pour activer : https://supabase.com/docs/guides/realtime/postgres-changes#enable-realtime
--
-- 2. Vérification du realtime :
--    Vous pouvez vérifier que le realtime est activé avec :
--    SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversations';
--
-- 3. Les politiques RLS sont automatiquement respectées par le realtime :
--    Les utilisateurs ne recevront que les événements pour les conversations
--    auxquelles ils ont accès selon les politiques RLS.

