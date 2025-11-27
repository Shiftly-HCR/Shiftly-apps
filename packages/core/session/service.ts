import type { SessionCache } from "./types";
import { SessionCacheManager } from "./cache";
import {
  getSession,
  getCurrentUser,
} from "@shiftly/data";
import {
  getCurrentProfile,
  type Profile,
} from "@shiftly/data";
import {
  getFreelanceProfile,
  getFreelanceExperiences,
  getFreelanceEducations,
} from "@shiftly/data";
import { getRecruiterMissions, type Mission } from "@shiftly/data";

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
      console.log(
        `[SessionCache] Requête Supabase #${this.requestCounter}`
      );
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

      // 6. Sauvegarder dans le cache
      this.cacheManager.write(emptyCache);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[SessionCache] Session chargée et mise en cache (${this.requestCounter} requêtes)`
        );
      }

      return emptyCache;
    } catch (error) {
      console.error("[SessionCache] Erreur lors du chargement de la session:", error);
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

        // Si c'est un freelance, rafraîchir aussi le profil freelance
        if (profile.role === "freelance") {
          this.incrementRequestCounter();
          const freelanceProfile = await getFreelanceProfile();
          this.cacheManager.update({
            freelanceProfile: freelanceProfile || null,
          });
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
    } catch (error) {
      console.error(
        "[SessionCache] Erreur lors du rafraîchissement des missions:",
        error
      );
    }
  }
}

