"use client";

import { useCachedAllEstablishments } from "@/hooks/cache/useCachedEstablishments";
import type { Establishment } from "@shiftly/data";

interface UseAllEstablishmentsReturn {
  establishments: Establishment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer tous les établissements (pour les commerciaux)
 *
 * Utilise maintenant le cache React Query pour éviter les requêtes redondantes.
 * L'API reste identique pour la compatibilité avec les composants existants.
 */
export function useAllEstablishments(): UseAllEstablishmentsReturn {
  const {
    data: establishments = [],
    isLoading,
    error,
    refetch,
  } = useCachedAllEstablishments();

  return {
    establishments,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: async () => {
      await refetch();
    },
  };
}
