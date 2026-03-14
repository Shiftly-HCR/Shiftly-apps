-- Permet les conversations directes sans mission (mission_id NULL)
-- tout en conservant l'unicité:
-- - 1 conversation par (mission, recruteur, freelance) si mission_id est renseigné
-- - 1 conversation directe par (recruiter, freelance) si mission_id est NULL

ALTER TABLE public.conversations
  ALTER COLUMN mission_id DROP NOT NULL;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS unique_mission_recruiter_freelance;

CREATE UNIQUE INDEX IF NOT EXISTS unique_conversation_with_mission
  ON public.conversations (mission_id, recruiter_id, freelance_id)
  WHERE mission_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_direct_conversation
  ON public.conversations (recruiter_id, freelance_id)
  WHERE mission_id IS NULL;
