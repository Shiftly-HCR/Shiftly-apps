-- Migration: Ajouter le rôle "admin" à la contrainte CHECK de profiles.role
-- Date: 2026-02-26
-- Description: La contrainte profiles_role_check limitait le rôle à freelance/recruiter/commercial.
--              Le rôle "admin" est utilisé dans le code mais absent de la contrainte.
--              Cette migration l'ajoute sans altérer les données existantes.

-- Supprimer l'ancienne contrainte
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Recréer avec "admin" inclus
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('freelance', 'recruiter', 'commercial', 'admin'));

COMMENT ON COLUMN public.profiles.role IS
  'Rôle de l''utilisateur: freelance, recruiter, commercial ou admin';
