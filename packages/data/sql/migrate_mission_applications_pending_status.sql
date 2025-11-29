-- =============================================
-- Migration : Ajout du statut "pending" et mise à jour du DEFAULT
-- =============================================
-- Ce script met à jour la table mission_applications pour :
-- 1. Ajouter "pending" comme statut valide
-- 2. Changer le DEFAULT de "applied" à "pending"
-- 3. Optionnellement, convertir les anciennes candidatures "applied" en "pending"

-- Étape 1 : Mettre à jour la contrainte CHECK pour inclure "pending"
ALTER TABLE public.mission_applications
DROP CONSTRAINT IF EXISTS mission_applications_status_check;

ALTER TABLE public.mission_applications
ADD CONSTRAINT mission_applications_status_check 
CHECK (status IN ('pending', 'applied', 'shortlisted', 'rejected', 'accepted', 'withdrawn'));

-- Étape 2 : Changer la valeur par défaut
ALTER TABLE public.mission_applications
ALTER COLUMN status SET DEFAULT 'pending';

-- Étape 3 (Optionnel) : Convertir les anciennes candidatures "applied" en "pending"
-- Décommentez cette ligne si vous voulez convertir les données existantes
-- UPDATE public.mission_applications SET status = 'pending' WHERE status = 'applied';

-- Étape 4 : Mettre à jour le commentaire
COMMENT ON COLUMN public.mission_applications.status IS 'Statut de la candidature: pending (en attente de traitement), applied (candidature envoyée - déprécié), shortlisted (présélectionné), rejected (refusé), accepted (accepté), withdrawn (retiré)';


