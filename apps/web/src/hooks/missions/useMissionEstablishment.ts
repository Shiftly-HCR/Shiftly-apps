"use client";

import { useState, useEffect } from "react";
import { getEstablishmentById, type Establishment } from "@shiftly/data";
import type { Mission } from "@shiftly/data";

/**
 * Hook pour récupérer et gérer les informations d'établissement d'une mission
 */
export function useMissionEstablishment(mission: Mission | null) {
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEstablishment = async () => {
      if (!mission?.establishment_id) {
        setEstablishment(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const establishmentData = await getEstablishmentById(
          mission.establishment_id
        );
        setEstablishment(establishmentData);
      } catch (err) {
        console.error("Erreur lors du chargement de l'établissement:", err);
        setError("Erreur lors du chargement de l'établissement");
      } finally {
        setIsLoading(false);
      }
    };

    loadEstablishment();
  }, [mission?.establishment_id]);

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

