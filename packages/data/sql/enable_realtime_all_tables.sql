-- =============================================
-- Activation du Realtime pour les tables conversations et messages
-- =============================================

-- IMPORTANT : Ce script active le realtime pour les tables conversations et messages
-- Il doit être exécuté après la création des tables et des politiques RLS

-- =============================================
-- Activation pour la table conversations
-- =============================================

-- Ajouter conversations à la publication realtime (si pas déjà présent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversations'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
      RAISE NOTICE '✓ Table conversations ajoutée à la publication realtime';
    ELSE
      RAISE NOTICE '⚠ Table conversations déjà dans la publication realtime';
    END IF;
  ELSE
    RAISE WARNING '⚠ La publication supabase_realtime n''existe pas. Activez le realtime dans le Dashboard Supabase.';
  END IF;
END $$;

-- Configurer REPLICA IDENTITY pour conversations
ALTER TABLE IF EXISTS public.conversations REPLICA IDENTITY FULL;

-- =============================================
-- Activation pour la table messages
-- =============================================

-- Ajouter messages à la publication realtime (si pas déjà présent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
      RAISE NOTICE '✓ Table messages ajoutée à la publication realtime';
    ELSE
      RAISE NOTICE '⚠ Table messages déjà dans la publication realtime';
    END IF;
  ELSE
    RAISE WARNING '⚠ La publication supabase_realtime n''existe pas. Activez le realtime dans le Dashboard Supabase.';
  END IF;
END $$;

-- Configurer REPLICA IDENTITY pour messages
ALTER TABLE IF EXISTS public.messages REPLICA IDENTITY FULL;

-- =============================================
-- Vérification finale
-- =============================================

-- Afficher les tables dans la publication realtime
SELECT 
  schemaname,
  tablename,
  '✓ Realtime activé' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('conversations', 'messages')
ORDER BY tablename;

-- =============================================
-- Notes importantes
-- =============================================

-- 1. Vérification dans le Dashboard :
--    Database > Replication > Tables
--    Les tables "conversations" et "messages" doivent apparaître avec le toggle activé
--
-- 2. Les politiques RLS sont automatiquement respectées :
--    - conversations : Seules les conversations où l'utilisateur est participant
--    - messages : Seuls les messages des conversations où l'utilisateur est participant
--
-- 3. Si le realtime ne fonctionne pas :
--    - Vérifiez que les politiques RLS sont activées
--    - Vérifiez dans le Dashboard que le realtime est activé
--    - Vérifiez les logs dans la console du navigateur

