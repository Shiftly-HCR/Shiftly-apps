-- =============================================
-- Correction des politiques RLS pour permettre
-- aux recruteurs de voir les expériences et formations
-- des freelances sur leurs profils
-- =============================================

-- Politique : Tous les utilisateurs authentifiés peuvent voir les expériences des freelances
-- (pour permettre aux recruteurs de voir les expériences sur les profils freelances)
DROP POLICY IF EXISTS "Anyone can view freelance experiences" ON public.freelance_experiences;
CREATE POLICY "Anyone can view freelance experiences"
  ON public.freelance_experiences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = freelance_experiences.user_id
      AND profiles.role = 'freelance'
    )
  );

-- Politique : Tous les utilisateurs authentifiés peuvent voir les formations des freelances
-- (pour permettre aux recruteurs de voir les formations sur les profils freelances)
DROP POLICY IF EXISTS "Anyone can view freelance educations" ON public.freelance_educations;
CREATE POLICY "Anyone can view freelance educations"
  ON public.freelance_educations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = freelance_educations.user_id
      AND profiles.role = 'freelance'
    )
  );








