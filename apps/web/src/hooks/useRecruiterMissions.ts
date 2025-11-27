"use client";

import { useEffect, useRef } from "react";
import { useSessionContext } from "../providers/SessionProvider";
import type { Mission } from "@shiftly/data";

/**
 * Hook pour accéder aux missions du recruteur
 * Si le cache est vide et que l'utilisateur est chargé, déclenche un refresh
 */
export function useRecruiterMissions(): {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const {
    cache,
    isLoading,
    error,
    refreshRecruiterMissions,
    isInitialized,
  } = useSessionContext();
  
  const hasTriedLoad = useRef(false);

  // Si le cache est initialisé mais que les missions ne sont pas chargées, les charger
  useEffect(() => {
    // Ne charger qu'une seule fois après l'initialisation
    if (
      isInitialized &&
      !isLoading &&
      !hasTriedLoad.current &&
      cache?.profile &&
      cache.profile.role !== "freelance"
    ) {
      // Si les missions ne sont pas définies ou sont vides, les charger
      if (!cache.recruiterMissions || cache.recruiterMissions.length === 0) {
        hasTriedLoad.current = true;
        // Charger les missions si elles ne sont pas dans le cache
        refreshRecruiterMissions().catch((error) => {
          console.error("Erreur lors du chargement des missions:", error);
          hasTriedLoad.current = false; // Permettre de réessayer en cas d'erreur
        });
      } else {
        // Les missions sont déjà chargées, marquer comme tenté
        hasTriedLoad.current = true;
      }
    }
  }, [isInitialized, isLoading, cache, refreshRecruiterMissions]);

  return {
    missions: cache?.recruiterMissions || [],
    isLoading,
    error,
    refresh: refreshRecruiterMissions,
  };
}

