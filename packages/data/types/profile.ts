/**
 * Types pour les données de profil LinkedIn importées via SerpAPI
 */

export interface LinkedInExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  description?: string;
}

export interface LinkedInEducation {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface LinkedInProfileData {
  fullName: string;
  headline?: string;
  location?: string;
  photoUrl?: string;
  summary?: string;
  experiences: LinkedInExperience[];
  educations: LinkedInEducation[];
  skills: string[];
}

/**
 * Types pour les données de profil freelance stockées dans Supabase
 */

export interface FreelanceExperience {
  id?: string;
  user_id: string;
  title: string;
  company: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FreelanceEducation {
  id?: string;
  user_id: string;
  school: string;
  degree?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FreelanceProfile {
  // Champs de base depuis profiles
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
  headline?: string;
  location?: string;
  role?: string;
  // Champs supplémentaires pour freelance
  summary?: string;
  skills?: string[];
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  hourly_rate?: number; // Tarif horaire en euros
  availability?: string; // Disponibilité (temps plein, temps partiel, etc.)
  created_at?: string;
  updated_at?: string;
}

export interface UpdateFreelanceProfileParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  headline?: string;
  location?: string;
  summary?: string;
  photo_url?: string;
  skills?: string[];
  daily_rate?: number; // TJM (Taux Journalier Moyen) en euros
  hourly_rate?: number; // Tarif horaire en euros
  availability?: string; // Disponibilité (temps plein, temps partiel, etc.)
}
