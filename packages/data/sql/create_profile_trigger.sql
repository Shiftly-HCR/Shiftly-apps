-- Fonction qui crée automatiquement un profil quand un utilisateur s'inscrit
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

-- Trigger qui s'exécute après la création d'un utilisateur dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Politique RLS (Row Level Security) pour la table profiles
-- Permet aux utilisateurs de lire leur propre profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Permet à tous les utilisateurs authentifiés de voir les profils freelances
-- (pour permettre aux recruteurs de voir les freelances sur la page /freelance)
DROP POLICY IF EXISTS "Anyone can view freelance profiles" ON public.profiles;
CREATE POLICY "Anyone can view freelance profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (role = 'freelance');

-- Permet aux utilisateurs de mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Permet la création automatique de profils via le trigger
DROP POLICY IF EXISTS "Allow trigger insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow user insert" ON public.profiles;

-- Autorise le trigger (rôle service) à insérer les profils
CREATE POLICY "Allow trigger insert"
  ON public.profiles
  FOR INSERT
  TO service_role, supabase_auth_admin
  WITH CHECK (true);

-- Autorise les utilisateurs authentifiés à créer leur propre profil
CREATE POLICY "Allow user insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

