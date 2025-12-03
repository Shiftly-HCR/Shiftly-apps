"use client";

import { useCachedMyCommercialEstablishments } from "@/hooks/cache/useCachedEstablishments";
import type { Establishment } from "@shiftly/data";

interface UseMyCommercialEstablishmentsReturn {
  establishments: Establishment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les établissements rattachés au commercial courant
 * 
 * Utilise maintenant le cache React Query pour éviter les requêtes redondantes.
 * L'API reste identique pour la compatibilité avec les composants existants.
 */
export function useMyCommercialEstablishments(): UseMyCommercialEstablishmentsReturn {
  const {
    data: establishments = [],
    isLoading,
    error,
    refetch,
  } = useCachedMyCommercialEstablishments();

  return {
    establishments,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}

