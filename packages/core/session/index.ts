export * from "./types";
export * from "./storage";
export * from "./cache";
export * from "./service";

/**
 * Factory pour créer une instance du service de cache
 */
import { SessionCacheManager } from "./cache";
import { SessionCacheService } from "./service";
import type { SessionCacheConfig } from "./types";

export function createSessionCacheService(
  config?: SessionCacheConfig
): SessionCacheService {
  const cacheManager = new SessionCacheManager(config);
  return new SessionCacheService(cacheManager);
}





