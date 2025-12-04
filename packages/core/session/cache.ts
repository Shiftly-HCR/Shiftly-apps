import type { SessionCache, SessionCacheConfig } from "./types";
import { SessionCacheStorage } from "./storage";

/**
 * Gestion du cache en mémoire et persistant
 */
export class SessionCacheManager {
  private memoryCache: SessionCache | null = null;
  private storage: SessionCacheStorage;
  private config: Required<Pick<SessionCacheConfig, "ttl">> & {
    storageKey: string;
    enablePersistentStorage: boolean;
  };

  constructor(config: SessionCacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes par défaut
      storageKey: config.storageKey || "shiftly_session_cache",
      enablePersistentStorage: config.enablePersistentStorage !== false,
    };
    this.storage = new SessionCacheStorage(this.config);
  }

  /**
   * Crée un cache vide
   */
  createEmptyCache(): SessionCache {
    return {
      session: null,
      user: null,
      profile: null,
      freelanceProfile: null,
      freelanceExperiences: [],
      freelanceEducations: [],
      recruiterMissions: [],
      profilesCache: {},
      missionsCache: {},
      freelanceExperiencesCache: {},
      freelanceEducationsCache: {},
      cachedAt: Date.now(),
      userId: null,
    };
  }

  /**
   * Vérifie si le cache est valide (non expiré et correspond à l'utilisateur)
   */
  isValid(cache: SessionCache | null, userId?: string | null): boolean {
    if (!cache) {
      return false;
    }

    // Vérifier l'expiration
    const now = Date.now();
    const age = now - cache.cachedAt;
    if (age > this.config.ttl) {
      return false;
    }

    // Vérifier que le cache correspond à l'utilisateur actuel
    if (userId && cache.userId !== userId) {
      return false;
    }

   return true;
  }

  /**
   * Lit le cache sans validation (utile pour une réhydratation immédiate)
   */
  readUnsafe(): SessionCache | null {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    const persistentCache = this.storage.read();
    if (persistentCache) {
      this.memoryCache = persistentCache;
      return persistentCache;
    }

    return null;
  }

  /**
   * Lit le cache (mémoire d'abord, puis persistant)
   */
  read(): SessionCache | null {
    // Essayer d'abord le cache en mémoire
    if (this.memoryCache && this.isValid(this.memoryCache)) {
      return this.memoryCache;
    }

    // Sinon, essayer le stockage persistant
    const persistentCache = this.storage.read();
    if (persistentCache && this.isValid(persistentCache)) {
      // Restaurer en mémoire
      this.memoryCache = persistentCache;
      return persistentCache;
    }

    return null;
  }

  /**
   * Écrit le cache (mémoire + persistant)
   */
  write(cache: SessionCache): void {
    this.memoryCache = cache;
    this.storage.write(cache);
  }

  /**
   * Supprime le cache (mémoire + persistant)
   */
  clear(): void {
    this.memoryCache = null;
    this.storage.clear();
  }

  /**
   * Met à jour une partie du cache
   */
  update(updates: Partial<SessionCache>): void {
    const current = this.read() || this.createEmptyCache();
    const updated: SessionCache = {
      ...current,
      ...updates,
      cachedAt: Date.now(),
    };
    this.write(updated);
  }
}
