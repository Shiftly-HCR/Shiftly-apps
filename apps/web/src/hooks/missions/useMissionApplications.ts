"use client";

import { useCachedMissionApplications } from "@/hooks/cache/useCachedApplications";
import type { MissionApplicationWithProfile } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'une mission (pour les recruteurs)
 * 
 * Utilise maintenant le cache React Query pour éviter les requêtes redondantes.
 * L'API reste identique pour la compatibilité avec les composants existants.
 */
export function useMissionApplications(missionId: string | null) {
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useCachedMissionApplications(missionId);

  return {
    applications,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}

