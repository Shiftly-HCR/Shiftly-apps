import type { SessionCache, SessionCacheConfig } from "./types";

/**
 * Gestion du stockage persistant du cache (localStorage côté web)
 */
export class SessionCacheStorage {
  private storageKey: string;
  private enablePersistentStorage: boolean;

  constructor(config: SessionCacheConfig = {}) {
    this.storageKey = config.storageKey || "shiftly_session_cache";
    this.enablePersistentStorage =
      config.enablePersistentStorage !== false;
  }

  /**
   * Vérifie si le stockage persistant est disponible
   */
  private isStorageAvailable(): boolean {
    if (!this.enablePersistentStorage) {
      return false;
    }

    if (typeof window === "undefined") {
      return false;
    }

    try {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lit le cache depuis le stockage persistant
   */
  read(): SessionCache | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const stored = window.localStorage.getItem(this.storageKey);
      if (!stored) {
        return null;
      }

      const cache = JSON.parse(stored) as SessionCache;
      return cache;
    } catch (error) {
      console.error("Erreur lors de la lecture du cache:", error);
      return null;
    }
  }

  /**
   * Écrit le cache dans le stockage persistant
   */
  write(cache: SessionCache): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(cache);
      window.localStorage.setItem(this.storageKey, serialized);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'écriture du cache:", error);
      return false;
    }
  }

  /**
   * Supprime le cache du stockage persistant
   */
  clear(): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      window.localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
      return false;
    }
  }
}











