-- =============================================
-- Migration : Ajouter le rôle "commercial" à la table profiles
-- =============================================

-- Étape 1 : Supprimer la contrainte CHECK existante sur role si elle existe
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Supprimer toutes les contraintes CHECK sur role
  ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS check_role;
  
  -- Supprimer toute autre contrainte CHECK qui pourrait exister
  -- (on liste toutes les contraintes et on les supprime une par une)
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND conname LIKE '%role%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Étape 2 : Mettre à jour les valeurs de role invalides
-- Si des profils ont des valeurs de role qui ne sont pas dans la liste autorisée,
-- on les met à 'recruiter' par défaut (ou NULL si préféré)
UPDATE public.profiles 
SET role = 'recruiter'
WHERE role IS NOT NULL 
  AND role NOT IN ('freelance', 'recruiter', 'commercial');

-- Étape 3 : Ajouter la contrainte CHECK pour limiter les valeurs de role
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IS NULL OR role IN ('freelance', 'recruiter', 'commercial'));

-- Mettre à jour la fonction handle_new_user pour s'assurer qu'elle accepte "commercial"
-- (déjà fait dans create_profile_trigger.sql, mais on le refait pour être sûr)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'recruiter'), -- Rôle depuis les métadonnées ou 'recruiter' par défaut
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assure que la fonction est exécutée avec les droits postgres et le bon search_path
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;

-- Commentaire
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur: freelance, recruiter ou commercial';

