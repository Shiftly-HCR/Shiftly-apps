"use client";

import { useSessionContext } from "@/providers/SessionProvider";
import type { SessionCache } from "@shiftly/core";

/**
 * Hook pour accéder au cache de session complet
 */
export function useSessionCache(): {
  cache: SessionCache | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
} {
  const {
    cache,
    isLoading,
    isInitialized,
    error,
    refresh,
    clear,
  } = useSessionContext();

  return {
    cache,
    isLoading,
    isInitialized,
    error,
    refresh,
    clear,
  };
}

