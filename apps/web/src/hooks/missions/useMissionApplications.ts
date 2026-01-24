"use client";

import { useMissionApplications as useMissionApplicationsQuery } from "@/hooks/queries";
import type { MissionApplicationWithProfile } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'une mission (pour les recruteurs)
 * @deprecated Utilisez directement useMissionApplications depuis @/hooks/queries
 */
export function useMissionApplications(missionId: string | null) {
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useMissionApplicationsQuery(missionId);

  return {
    applications,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}

