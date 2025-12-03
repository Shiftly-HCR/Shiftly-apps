"use client";

import { useCachedUserApplications } from "@/hooks/cache/useCachedApplications";
import type { MissionApplicationWithMission } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'un freelance
 * 
 * Utilise maintenant le cache React Query pour éviter les requêtes redondantes.
 * L'API reste identique pour la compatibilité avec les composants existants.
 */
export function useUserApplications(userId?: string) {
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useCachedUserApplications(userId);

  return {
    applications,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}

