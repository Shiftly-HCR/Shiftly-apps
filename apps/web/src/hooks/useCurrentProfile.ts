"use client";

import { useSessionContext } from "../providers/SessionProvider";
import type { Profile } from "@shiftly/data";

/**
 * Hook pour accéder au profil de l'utilisateur actuel
 */
export function useCurrentProfile(): {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { cache, isLoading, error, refreshProfile } = useSessionContext();

  return {
    profile: cache?.profile || null,
    isLoading,
    error,
    refresh: refreshProfile,
  };
}




