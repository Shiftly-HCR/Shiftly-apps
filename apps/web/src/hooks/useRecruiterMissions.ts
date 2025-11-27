"use client";

import { useSessionContext } from "../providers/SessionProvider";
import type { Mission } from "@shiftly/data";

/**
 * Hook pour accéder aux missions du recruteur
 */
export function useRecruiterMissions(): {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { cache, isLoading, error, refreshRecruiterMissions } =
    useSessionContext();

  return {
    missions: cache?.recruiterMissions || [],
    isLoading,
    error,
    refresh: refreshRecruiterMissions,
  };
}

