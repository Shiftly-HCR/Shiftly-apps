import type { SessionCache } from "./types";
import { SessionCacheManager } from "./cache";
import { getSession, getCurrentUser } from "@shiftly/data";
import { getCurrentProfile, getProfileById, type Profile } from "@shiftly/data";
import {
  getFreelanceProfile,
  getFreelanceExperiences,
  getFreelanceEducations,
  getFreelanceExperiencesById,
  getFreelanceEducationsById,
  type FreelanceProfile,
  type FreelanceExperience,
  type FreelanceEducation,
} from "@shiftly/data";
import {
  getRecruiterMissions,
  getMissionById,
  type Mission,
} from "@shiftly/data";

/**
 * Service central de gestion de la session cache
 * Charge les données depuis Supabase et les met en cache
 */
export class SessionCacheService {
  private cacheManager: SessionCacheManager;
  private requestCounter: number = 0; // Compteur pour l'instrumentation

  constructor(cacheManager: SessionCacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * Compte les requêtes Supabase (pour instrumentation dev)
   */
  private incrementRequestCounter(): void {
    this.requestCounter++;
   if (process.env.NODE_ENV === "development") {
      console.log(`[SessionCache] Requête Supabase #${this.requestCounter}`);
    }
  }

  /**
   * Récupère le nombre de requêtes effectuées
   */
  getRequestCount(): number {
    return this.requestCounter;
  }

  /**
   * Réinitialise le compteur de requêtes
   */
  resetRequestCount(): void {
    this.requestCounter = 0;
  }

  /**
   * Récupère la session depuis le cache de manière synchrone (sans appel réseau)
   * Retourne null si aucun cache valide n'est trouvé
   */
  getCachedSession(): SessionCache | null {
    const cached = this.cacheManager.readUnsafe();
    return cached || null;
  }

  /**
   * Charge la session complète depuis Supabase
   */
  async loadSession(): Promise<SessionCache> {
    const emptyCache = this.cacheManager.createEmptyCache();

    try {
      // 1. Charger la session auth
      this.incrementRequestCounter();
      const session = await getSession();
      emptyCache.session = session;

      if (!session) {
        return emptyCache;
      }

      // 2. Charger l'utilisateur
      this.incrementRequestCounter();
      const user = await getCurrentUser();
      emptyCache.user = user;
      emptyCache.userId = user?.id || null;

      if (!user) {
        return emptyCache;
      }

      // 3. Charger le profil de base
      this.incrementRequestCounter();
      const profile = await getCurrentProfile();
      emptyCache.profile = profile;

      if (!profile) {
        return emptyCache;
      }

      // 4. Charger les données selon le rôle
      const role = profile.role;

      if (role === "freelance") {
        // Charger le profil freelance complet
        this.incrementRequestCounter();
        const freelanceProfile = await getFreelanceProfile();
        emptyCache.freelanceProfile = freelanceProfile;

        // Charger les expériences
        this.incrementRequestCounter();
        const experiences = await getFreelanceExperiences();
        emptyCache.freelanceExperiences = experiences;

        // Charger les formations
        this.incrementRequestCounter();
        const educations = await getFreelanceEducations();
        emptyCache.freelanceEducations = educations;
      } else {
        // Par défaut (recruiter ou rôle non défini), charger les missions
        // Cela permet de gérer les cas où le rôle n'est pas encore défini
        this.incrementRequestCounter();
        const missions = await getRecruiterMissions();
        emptyCache.recruiterMissions = missions;
      }

      // 5. Mettre à jour le timestamp
      emptyCache.cachedAt = Date.now();

      // 6. Mettre en cache les données de l'utilisateur dans les caches globaux
      if (emptyCache.profile) {
        emptyCache.profilesCache[emptyCache.profile.id] = emptyCache.profile;
      }
      if (emptyCache.freelanceProfile) {
        emptyCache.profilesCache[emptyCache.freelanceProfile.id] =
          emptyCache.freelanceProfile;
      }
      if (emptyCache.freelanceExperiences.length > 0 && emptyCache.userId) {
        emptyCache.freelanceExperiencesCache[emptyCache.userId] =
          emptyCache.freelanceExperiences;
      }
      if (emptyCache.freelanceEducations.length > 0 && emptyCache.userId) {
        emptyCache.freelanceEducationsCache[emptyCache.userId] =
          emptyCache.freelanceEducations;
      }
      if (emptyCache.recruiterMissions.length > 0) {
        emptyCache.recruiterMissions.forEach((mission) => {
          emptyCache.missionsCache[mission.id] = mission;
        });
      }

      // 7. Sauvegarder dans le cache
      this.cacheManager.write(emptyCache);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[SessionCache] Session chargée et mise en cache (${this.requestCounter} requêtes)`
        );
      }

      return emptyCache;
    } catch (error) {
      console.error(
        "[SessionCache] Erreur lors du chargement de la session:",
        error
      );
      return emptyCache;
    }
  }

  /**
   * Récupère la session depuis le cache ou la charge depuis Supabase si nécessaire
   */
  async getSession(forceRefresh: boolean = false): Promise<SessionCache> {
    if (forceRefresh) {
      return this.loadSession();
    }

    // Vérifier si un cache valide existe
    const cached = this.cacheManager.read();
    if (cached && this.cacheManager.isValid(cached, cached.userId)) {
      if (process.env.NODE_ENV === "development") {
        console.log("[SessionCache] Utilisation du cache (0 requêtes)");
      }
      return cached;
    }

    // Sinon, charger depuis Supabase
    return this.loadSession();
  }

  /**
   * Rafraîchit le cache (recharge depuis Supabase)
   */
  async refresh(): Promise<SessionCache> {
    return this.loadSession();
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cacheManager.clear();
    this.resetRequestCount();
  }

  /**
   * Met à jour une partie spécifique du cache après une mutation
   */
  async refreshProfile(): Promise<void> {
    const current = this.cacheManager.read();
    if (!current || !current.userId) {
      return;
    }

    try {
      this.incrementRequestCounter();
      const profile = await getCurrentProfile();
      if (profile) {
        this.cacheManager.update({ profile });

        // Mettre à jour le cache global des profils
        const updatedCache = this.cacheManager.read();
        if (updatedCache && profile) {
          updatedCache.profilesCache[profile.id] = profile;
          this.cacheManager.write(updatedCache);
        }

        // Si c'est un freelance, rafraîchir aussi le profil freelance
        if (profile.role === "freelance") {
          this.incrementRequestCounter();
          const freelanceProfile = await getFreelanceProfile();
          if (freelanceProfile) {
            this.cacheManager.update({
              freelanceProfile: freelanceProfile || null,
            });

            // Mettre à jour le cache global
            const updatedCache2 = this.cacheManager.read();
            if (updatedCache2 && freelanceProfile) {
              updatedCache2.profilesCache[freelanceProfile.id] =
                freelanceProfile;
              this.cacheManager.write(updatedCache2);
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "[SessionCache] Erreur lors du rafraîchissement du profil:",
        error
      );
    }
  }

  /**
   * Met à jour les expériences freelance dans le cache
   */
  async refreshFreelanceExperiences(): Promise<void> {
    const current = this.cacheManager.read();
    if (!current || !current.userId) {
      return;
    }

    try {
      this.incrementRequestCounter();
      const experiences = await getFreelanceExperiences();
      this.cacheManager.update({ freelanceExperiences: experiences });

      // Mettre à jour le cache global
      const updatedCache = this.cacheManager.read();
      if (updatedCache && experiences.length > 0) {
        updatedCache.freelanceExperiencesCache[current.userId] = experiences;
        this.cacheManager.write(updatedCache);
      }
    } catch (error) {
      console.error(
        "[SessionCache] Erreur lors du rafraîchissement des expériences:",
        error
      );
    }
  }

  /**
   * Met à jour les formations freelance dans le cache
   */
  async refreshFreelanceEducations(): Promise<void> {
    const current = this.cacheManager.read();
    if (!current || !current.userId) {
      return;
    }

    try {
      this.incrementRequestCounter();
      const educations = await getFreelanceEducations();
      this.cacheManager.update({ freelanceEducations: educations });

      // Mettre à jour le cache global
      const updatedCache = this.cacheManager.read();
      if (updatedCache && educations.length > 0) {
        updatedCache.freelanceEducationsCache[current.userId] = educations;
        this.cacheManager.write(updatedCache);
      }
    } catch (error) {
      console.error(
        "[SessionCache] Erreur lors du rafraîchissement des formations:",
        error
      );
    }
  }

  /**
   * Met à jour les missions recruteur dans le cache
   */
  async refreshRecruiterMissions(): Promise<void> {
    const current = this.cacheManager.read();
    if (!current || !current.userId) {
      return;
    }

    try {
      this.incrementRequestCounter();
      const missions = await getRecruiterMissions();
      this.cacheManager.update({ recruiterMissions: missions });

      // Mettre à jour le cache global des missions
      const updatedCache = this.cacheManager.read();
      if (updatedCache) {
        missions.forEach((mission) => {
          updatedCache.missionsCache[mission.id] = mission;
        });
        this.cacheManager.write(updatedCache);
      }
    } catch (error) {
      console.error(
        "[SessionCache] Erreur lors du rafraîchissement des missions:",
        error
      );
    }
  }

  /**
   * Récupère un profil depuis le cache ou null si non trouvé
   */
  getProfileFromCache(profileId: string): Profile | FreelanceProfile | null {
    const cached = this.cacheManager.read();
    if (!cached) {
      return null;
    }
    return cached.profilesCache[profileId] || null;
  }

  /**
   * Met en cache un profil (ou plusieurs)
   */
  cacheProfiles(profiles: (Profile | FreelanceProfile)[]): void {
    const current = this.cacheManager.read();
    if (!current) {
      return;
    }

    profiles.forEach((profile) => {
      current.profilesCache[profile.id] = profile;
    });

    this.cacheManager.write(current);
  }

  /**
   * Récupère une mission depuis le cache ou null si non trouvée
   */
  getMissionFromCache(missionId: string): Mission | null {
    const cached = this.cacheManager.read();
    if (!cached) {
      return null;
    }
    return cached.missionsCache[missionId] || null;
  }

  /**
   * Met en cache une mission (ou plusieurs)
   */
  cacheMissions(missions: Mission[]): void {
    const current = this.cacheManager.read();
    if (!current) {
      return;
    }

    missions.forEach((mission) => {
      current.missionsCache[mission.id] = mission;
    });

    this.cacheManager.write(current);
  }

  /**
   * Récupère les expériences d'un freelance depuis le cache
   */
  getFreelanceExperiencesFromCache(userId: string): FreelanceExperience[] {
    const cached = this.cacheManager.read();
    if (!cached) {
      return [];
    }
    return cached.freelanceExperiencesCache[userId] || [];
  }

  /**
   * Récupère les formations d'un freelance depuis le cache
   */
  getFreelanceEducationsFromCache(userId: string): FreelanceEducation[] {
    const cached = this.cacheManager.read();
    if (!cached) {
      return [];
    }
    return cached.freelanceEducationsCache[userId] || [];
  }

  /**
   * Met en cache les expériences d'un freelance
   */
  cacheFreelanceExperiences(
    userId: string,
    experiences: FreelanceExperience[]
  ): void {
    const current = this.cacheManager.read();
    if (!current) {
      return;
    }

    current.freelanceExperiencesCache[userId] = experiences;
    this.cacheManager.write(current);
  }

  /**
   * Met en cache les formations d'un freelance
   */
  cacheFreelanceEducations(
    userId: string,
    educations: FreelanceEducation[]
  ): void {
    const current = this.cacheManager.read();
    if (!current) {
      return;
    }

    current.freelanceEducationsCache[userId] = educations;
    this.cacheManager.write(current);
  }
}
