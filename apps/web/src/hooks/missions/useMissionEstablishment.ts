"use client";

import { useState, useEffect } from "react";
import {
  getEstablishmentById,
  getEstablishmentByIdPublic,
  type Establishment,
} from "@shiftly/data";
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
        // Essayer d'abord de récupérer en tant que propriétaire
        let establishmentData = await getEstablishmentById(
          mission.establishment_id
        );

        // Si pas trouvé (pas le propriétaire), essayer la version publique
        // qui permet de voir l'établissement s'il est lié à une mission publiée
        if (!establishmentData && mission.status === "published") {
          establishmentData = await getEstablishmentByIdPublic(
            mission.establishment_id
          );
        }

        setEstablishment(establishmentData);
      } catch (err) {
        console.error("Erreur lors du chargement de l'établissement:", err);
        setError("Erreur lors du chargement de l'établissement");
      } finally {
        setIsLoading(false);
      }
    };

    loadEstablishment();
  }, [mission?.establishment_id, mission?.status]);

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

