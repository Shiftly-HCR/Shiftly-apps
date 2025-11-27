import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@shiftly/data";
import type {
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
} from "@shiftly/data";
import type { Mission } from "@shiftly/data";

/**
 * Structure complète du cache de session
 */
export interface SessionCache {
  // Session Supabase
  session: Session | null;
  user: User | null;

  // Profil utilisateur
  profile: Profile | null;

  // Données spécifiques au rôle freelance
  freelanceProfile: FreelanceProfile | null;
  freelanceExperiences: FreelanceExperience[];
  freelanceEducations: FreelanceEducation[];

  // Missions (pour recruteurs ou autres rôles)
  recruiterMissions: Mission[];

  // Métadonnées du cache
  cachedAt: number; // Timestamp de la dernière mise à jour
  userId: string | null; // ID de l'utilisateur pour validation
}

/**
 * État de chargement du cache
 */
export interface SessionCacheState {
  cache: SessionCache | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

/**
 * Options de configuration du cache
 */
export interface SessionCacheConfig {
  ttl?: number; // Time to live en millisecondes (défaut: 5 minutes)
  storageKey?: string; // Clé pour le localStorage (défaut: 'shiftly_session_cache')
  enablePersistentStorage?: boolean; // Activer le stockage persistant (défaut: true)
}

/**
 * Résultat d'une opération de cache
 */
export interface CacheOperationResult {
  success: boolean;
  error?: string;
}

