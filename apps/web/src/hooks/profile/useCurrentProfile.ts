"use client";

import { useCurrentProfile as useCurrentProfileQuery } from "@/hooks/queries";
import type { Profile } from "@shiftly/data";

/**
 * Hook pour accéder au profil de l'utilisateur actuel
 * @deprecated Utilisez directement useCurrentProfile depuis @/hooks/queries
 */
export function useCurrentProfile(): {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { data: profile, isLoading, error, refetch } = useCurrentProfileQuery();

  return {
    profile: profile || null,
    isLoading,
    error: error?.message || null,
    refresh: async () => {
      await refetch();
    },
  };
}

