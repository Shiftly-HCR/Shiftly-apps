-- =============================================
-- Configuration du bucket Storage pour les images de missions
-- =============================================

-- Note: Le bucket 'mission-images' doit être créé manuellement dans le Dashboard Supabase
-- avec l'option "Public bucket" activée

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Les recruteurs peuvent uploader des images de missions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mission-images' AND
  (storage.foldername(name))[1] = 'missions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique pour permettre la mise à jour de leurs propres images
CREATE POLICY "Les recruteurs peuvent mettre à jour leurs images de missions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mission-images' AND
  (storage.foldername(name))[1] = 'missions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique pour permettre la suppression de leurs propres images
CREATE POLICY "Les recruteurs peuvent supprimer leurs images de missions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'mission-images' AND
  (storage.foldername(name))[1] = 'missions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Politique pour permettre la lecture publique des images de missions
CREATE POLICY "Les images de missions sont publiquement accessibles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mission-images');

