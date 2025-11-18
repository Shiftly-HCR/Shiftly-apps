-- =============================================
-- Configuration des politiques de sécurité pour Supabase Storage
-- Bucket: avatars
-- =============================================

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Les utilisateurs peuvent uploader leurs avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique pour permettre la mise à jour de leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique pour permettre la suppression de leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent supprimer leurs avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profiles' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique pour permettre la lecture publique des avatars
CREATE POLICY "Les avatars sont publiquement accessibles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

