-- Ajoute le suivi des notifications email sur la table messages
-- Sans créer de nouvelle table.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS notification_status TEXT,
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_error TEXT;

COMMENT ON COLUMN public.messages.notification_status IS 'Statut notification email (sent, skipped_cooldown, skipped_no_email, error)';
COMMENT ON COLUMN public.messages.notification_sent_at IS 'Date d''envoi de l''email de notification';
COMMENT ON COLUMN public.messages.notification_error IS 'Détails d''erreur de notification email';
