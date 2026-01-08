/**
 * Types pour les candidatures aux missions
 */

/**
 * Statuts possibles d'une candidature
 */
export type ApplicationStatus =
  | "pending" // En attente de traitement par le recruteur
  | "applied" // Candidature envoyée (déprécié, utiliser "pending")
  | "shortlisted" // Présélectionné
  | "rejected" // Refusé
  | "accepted" // Accepté
  | "withdrawn"; // Retiré par le freelance

/**
 * Candidature complète avec toutes les informations
 */
export interface MissionApplication {
  id: string;
  created_at?: string;
  updated_at?: string;
  mission_id: string;
  user_id: string;
  status: ApplicationStatus;
  cover_letter?: string;
}

/**
 * Candidature avec les informations du profil du freelance
 */
export interface MissionApplicationWithProfile extends MissionApplication {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    photo_url?: string;
    bio?: string;
    headline?: string;
    location?: string;
    role?: string;
    daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  } | null;
}

/**
 * Candidature avec les informations de la mission
 */
export interface MissionApplicationWithMission extends MissionApplication {
  mission: {
    id: string;
    title: string;
    description?: string;
    city?: string;
    start_date?: string;
    end_date?: string;
    hourly_rate?: number;
    status?: string;
  } | null;
}

/**
 * Paramètres pour créer une candidature
 */
export interface CreateApplicationParams {
  mission_id: string;
  cover_letter?: string;
}

/**
 * Paramètres pour mettre à jour une candidature
 */
export interface UpdateApplicationParams {
  status?: ApplicationStatus;
  cover_letter?: string;
}
