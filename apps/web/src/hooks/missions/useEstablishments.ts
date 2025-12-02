"use client";

import { useMyEstablishments } from "@shiftly/data";

/**
 * Hook pour gérer les établissements dans le contexte des missions
 */
export function useEstablishments() {
  const {
    establishments,
    isLoading,
    error,
    refetch,
    create,
    update,
    remove,
  } = useMyEstablishments();

  return {
    establishments,
    isLoading,
    error,
    refetch,
    create,
    update,
    remove,
  };
}

