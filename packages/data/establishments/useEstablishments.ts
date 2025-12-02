"use client";

import { useState, useEffect } from "react";
import {
  listMyEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  type Establishment,
  type CreateEstablishmentParams,
  type UpdateEstablishmentParams,
} from "./establishments";

/**
 * Hook React pour gérer les établissements du recruteur courant
 */
export function useMyEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = async () => {
    setIsLoading(true);
    setError(null);

    const result = await listMyEstablishments();

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

  const create = async (params: CreateEstablishmentParams) => {
    const result = await createEstablishment(params);
    if (result.success) {
      await fetchEstablishments(); // Recharger la liste
    }
    return result;
  };

  const update = async (
    establishmentId: string,
    params: UpdateEstablishmentParams
  ) => {
    const result = await updateEstablishment(establishmentId, params);
    if (result.success) {
      await fetchEstablishments(); // Recharger la liste
    }
    return result;
  };

  const remove = async (establishmentId: string) => {
    const result = await deleteEstablishment(establishmentId);
    if (result.success) {
      await fetchEstablishments(); // Recharger la liste
    }
    return result;
  };

  return {
    establishments,
    isLoading,
    error,
    refetch: fetchEstablishments,
    create,
    update,
    remove,
  };
}

