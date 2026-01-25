"use client";

import { useRecruiterMissions as useRecruiterMissionsQuery } from "@/hooks/queries";
import type { Mission } from "@shiftly/data";

/**
 * Hook pour accéder aux missions du recruteur
 * @deprecated Utilisez directement useRecruiterMissions depuis @/hooks/queries
 */
export function useRecruiterMissions(): {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { data: missions = [], isLoading, error, refetch } = useRecruiterMissionsQuery();

  return {
    missions,
    isLoading,
    error: error?.message || null,
    refresh: async () => {
      await refetch();
    },
  };
}

