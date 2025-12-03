"use client";

import { useState, useEffect } from "react";
import { listAllEstablishments } from "@shiftly/data";
import type { Establishment } from "@shiftly/data";

interface UseAllEstablishmentsReturn {
  establishments: Establishment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer tous les établissements (pour les commerciaux)
 */
export function useAllEstablishments(): UseAllEstablishmentsReturn {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = async () => {
    setIsLoading(true);
    setError(null);

    const result = await listAllEstablishments();

    if (result.success && result.establishments) {
      setEstablishments(result.establishments);
    } else {
      setError(result.error || "Erreur lors du chargement des établissements");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  return {
    establishments,
    isLoading,
    error,
    refetch: fetchEstablishments,
  };
}

