-- =============================================
-- Tables pour les profils freelances
-- =============================================
-- Ce script est sûr à exécuter sur une base existante :
-- - Les nouvelles tables utilisent CREATE TABLE IF NOT EXISTS
-- - Les colonnes ajoutées à profiles utilisent IF NOT EXISTS
-- - Les politiques RLS utilisent DROP POLICY IF EXISTS avant création
-- =============================================

-- Table des expériences professionnelles
-- Cette table est créée uniquement si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.freelance_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des formations/éducations
-- Cette table est créée uniquement si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.freelance_educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT,
  field TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_freelance_experiences_user ON public.freelance_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_freelance_educations_user ON public.freelance_educations(user_id);

-- =============================================
-- Mise à jour de la table profiles pour ajouter les champs freelance
-- =============================================
-- IMPORTANT : Ces colonnes sont ajoutées uniquement si elles n'existent pas déjà.
-- Aucune donnée existante ne sera modifiée ou supprimée.
-- =============================================

-- Ajouter les colonnes si elles n'existent pas déjà
-- Vérification sécurisée pour éviter les erreurs si les colonnes existent déjà
DO $$ 
BEGIN
  -- Ajouter headline si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'headline') THEN
    ALTER TABLE public.profiles ADD COLUMN headline TEXT;
  END IF;

  -- Ajouter location si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'location') THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT;
  END IF;

  -- Ajouter summary si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'summary') THEN
    ALTER TABLE public.profiles ADD COLUMN summary TEXT;
  END IF;

  -- Ajouter skills (JSONB array) si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'skills') THEN
    ALTER TABLE public.profiles ADD COLUMN skills TEXT[];
  END IF;
END $$;

-- =============================================
-- Politiques RLS (Row Level Security)
-- =============================================

-- Activer RLS sur les tables
ALTER TABLE public.freelance_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelance_educations ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres expériences
DROP POLICY IF EXISTS "Users can view their own experiences" ON public.freelance_experiences;
CREATE POLICY "Users can view their own experiences"
  ON public.freelance_experiences
  FOR SELECT
  USING (auth.uid() = user_id);

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

-- Politique : Les utilisateurs peuvent créer leurs propres expériences
DROP POLICY IF EXISTS "Users can create their own experiences" ON public.freelance_experiences;
CREATE POLICY "Users can create their own experiences"
  ON public.freelance_experiences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres expériences
DROP POLICY IF EXISTS "Users can update their own experiences" ON public.freelance_experiences;
CREATE POLICY "Users can update their own experiences"
  ON public.freelance_experiences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres expériences
DROP POLICY IF EXISTS "Users can delete their own experiences" ON public.freelance_experiences;
CREATE POLICY "Users can delete their own experiences"
  ON public.freelance_experiences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent voir leurs propres formations
DROP POLICY IF EXISTS "Users can view their own educations" ON public.freelance_educations;
CREATE POLICY "Users can view their own educations"
  ON public.freelance_educations
  FOR SELECT
  USING (auth.uid() = user_id);

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

-- Politique : Les utilisateurs peuvent créer leurs propres formations
DROP POLICY IF EXISTS "Users can create their own educations" ON public.freelance_educations;
CREATE POLICY "Users can create their own educations"
  ON public.freelance_educations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres formations
DROP POLICY IF EXISTS "Users can update their own educations" ON public.freelance_educations;
CREATE POLICY "Users can update their own educations"
  ON public.freelance_educations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres formations
DROP POLICY IF EXISTS "Users can delete their own educations" ON public.freelance_educations;
CREATE POLICY "Users can delete their own educations"
  ON public.freelance_educations
  FOR DELETE
  USING (auth.uid() = user_id);

