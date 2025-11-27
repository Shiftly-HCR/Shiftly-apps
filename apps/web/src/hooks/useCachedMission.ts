"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "../providers/SessionProvider";
import { getMissionById, type Mission } from "@shiftly/data";

/**
 * Hook pour récupérer une mission avec cache
 * Vérifie d'abord le cache, puis fait une requête Supabase si nécessaire
 */
export function useCachedMission(missionId: string | null) {
  const { getMissionFromCache, cacheMissions } = useSessionContext();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!missionId) {
      setMission(null);
      setIsLoading(false);
      return;
    }

    const loadMission = async () => {
      setIsLoading(true);
      setError(null);

      // 1. Vérifier le cache d'abord
      const cached = getMissionFromCache(missionId);
      if (cached) {
        setMission(cached);
        setIsLoading(false);
        return;
      }

      // 2. Si pas dans le cache, charger depuis Supabase
      try {
        const loadedMission = await getMissionById(missionId);
        if (loadedMission) {
          setMission(loadedMission);
          // Mettre en cache
          cacheMissions([loadedMission]);
        } else {
          setError("Mission non trouvée");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de la mission");
      } finally {
        setIsLoading(false);
      }
    };

    loadMission();
  }, [missionId, getMissionFromCache, cacheMissions]);

  return { mission, isLoading, error };
}


