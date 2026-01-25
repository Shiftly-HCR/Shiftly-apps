"use client";

import { useUserApplications as useUserApplicationsQuery } from "@/hooks/queries";
import type { MissionApplicationWithMission } from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'un freelance
 * @deprecated Utilisez directement useUserApplications depuis @/hooks/queries
 */
export function useUserApplications(userId?: string) {
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useUserApplicationsQuery();

  return {
    applications,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}

