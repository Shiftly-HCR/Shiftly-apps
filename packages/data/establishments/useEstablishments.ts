"use client";

import { useState, useEffect, useRef } from "react";
import { getSession } from "../auth/auth";
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
  const hasFetchedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEstablishments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier d'abord si l'utilisateur est authentifié
      const session = await getSession();

      if (!session) {
        // Pas de session, arrêter le chargement
        setEstablishments([]);
        setIsLoading(false);
        return;
      }

      const result = await listMyEstablishments();

      if (result.success && result.establishments) {
        setEstablishments(result.establishments);
      } else {
        setError(
          result.error || "Erreur lors du chargement des établissements"
        );
        setEstablishments([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des établissements:", err);
      setError("Une erreur est survenue lors du chargement des établissements");
      setEstablishments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Éviter les appels multiples
    if (hasFetchedRef.current) return;

    const loadData = async () => {
      // Vérifier d'abord si on a une session
      const session = await getSession();

      if (!session) {
        // Si pas de session, attendre un peu puis réessayer (max 3 secondes)
        let attempts = 0;
        const maxAttempts = 6; // 6 tentatives sur 3 secondes (500ms chacune)

        const checkSession = async () => {
          attempts++;
          const currentSession = await getSession();

          if (currentSession) {
            // Session trouvée, charger les données
            hasFetchedRef.current = true;
            await fetchEstablishments();
          } else if (attempts < maxAttempts) {
            // Réessayer après 500ms
            timeoutRef.current = setTimeout(checkSession, 500);
          } else {
            // Timeout : pas de session après 3 secondes
            setEstablishments([]);
            setIsLoading(false);
          }
        };

        timeoutRef.current = setTimeout(checkSession, 500);
      } else {
        // Session disponible, charger immédiatement
        hasFetchedRef.current = true;
        await fetchEstablishments();
      }
    };

    loadData();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
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
