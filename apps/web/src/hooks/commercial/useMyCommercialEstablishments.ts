"use client";

import { useMyCommercialEstablishments as useMyCommercialEstablishmentsQuery } from "@/hooks/queries";
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
 * Utilise React Query pour éviter les requêtes redondantes.
 * L'API reste identique pour la compatibilité avec les composants existants.
 */
export function useMyCommercialEstablishments(): UseMyCommercialEstablishmentsReturn {
  const {
    data: establishments = [],
    isLoading,
    error,
    refetch,
  } = useMyCommercialEstablishmentsQuery();

  return {
    establishments,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}

