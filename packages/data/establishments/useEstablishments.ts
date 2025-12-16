"use client";

import { useState, useEffect, useRef } from "react";
import { getSession } from "../auth/auth";
import {
  listMyEstablishments,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
} from "./establishments";
import type {
  Establishment,
  CreateEstablishmentParams,
  UpdateEstablishmentParams,
} from "../types/establishment";

/**
 * Hook React pour gérer les établissements du recruteur courant
 */
export function useMyEstablishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEstablishments = async () => {
    // Éviter les appels multiples simultanés
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier d'abord si l'utilisateur est authentifié
      const session = await getSession();

      if (!session) {
        // Pas de session, arrêter le chargement
        setEstablishments([]);
        setIsLoading(false);
        isLoadingRef.current = false;
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
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 6; // 6 tentatives sur 3 secondes (500ms chacune)

    const loadData = async () => {
      // Vérifier d'abord si on a une session
      const session = await getSession();

      if (!session) {
        // Si pas de session, attendre un peu puis réessayer (max 3 secondes)
        const checkSession = async () => {
          if (!isMounted) return; // Ne rien faire si le composant est démonté

          attempts++;
          const currentSession = await getSession();

          if (currentSession) {
            // Session trouvée, charger les données
            if (isMounted) {
              await fetchEstablishments();
            }
          } else if (attempts < maxAttempts && isMounted) {
            // Réessayer après 500ms
            timeoutRef.current = setTimeout(checkSession, 500);
          } else if (isMounted) {
            // Timeout : pas de session après 3 secondes
            setEstablishments([]);
            setIsLoading(false);
            isLoadingRef.current = false;
          }
        };

        timeoutRef.current = setTimeout(checkSession, 500);
      } else {
        // Session disponible, charger immédiatement
        if (isMounted) {
          await fetchEstablishments();
        }
      }
    };

    // Toujours charger les données au montage
    loadData();

    // Cleanup
    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Réinitialiser le flag de chargement au démontage
      isLoadingRef.current = false;
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
