"use client";

import { useCachedEstablishment } from "@/hooks/cache/useCachedEstablishment";
import type { Mission } from "@shiftly/data";

/**
 * Hook pour récupérer et gérer les informations d'établissement d'une mission
 * 
 * Utilise maintenant le cache React Query pour éviter les requêtes redondantes.
 * L'API reste identique pour la compatibilité avec les composants existants.
 */
export function useMissionEstablishment(mission: Mission | null) {
  const {
    data: establishment = null,
    isLoading,
    error,
  } = useCachedEstablishment(
    mission?.establishment_id,
    mission?.status === "published"
  );

  // Déterminer les informations à afficher
  const hasEstablishment = !!establishment;
  const displayName = establishment?.name || "Établissement";
  const displayAddress =
    establishment?.address || mission?.address || "Adresse non renseignée";
  const displayCity =
    establishment?.city || mission?.city || "Ville non renseignée";

  return {
    establishment,
    isLoading,
    error,
    displayName,
    displayAddress,
    displayCity,
    hasEstablishment,
  };
}

