"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublishedMissions, type Mission } from "@shiftly/data";
import { useSessionContext } from "@/providers/SessionProvider";

/**
 * Hook pour récupérer toutes les missions publiées avec cache React Query
 *
 * Ce hook utilise React Query pour mettre en cache les missions et éviter
 * les requêtes Supabase redondantes. Les données sont partagées entre tous
 * les composants qui utilisent ce hook.
 *
 * @returns Les missions publiées, l'état de chargement et les erreurs
 */
export function useCachedMissions() {
  const { cacheMissions, getMissionFromCache } = useSessionContext();

  return useQuery({
    queryKey: ["missions", "published"],
    queryFn: async () => {
      const missions = await getPublishedMissions();

      // Mettre en cache dans SessionProvider pour compatibilité
      if (missions.length > 0) {
        cacheMissions(missions);
      }

      return missions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook pour récupérer une mission spécifique depuis le cache ou Supabase
 *
 * @param missionId - ID de la mission à récupérer
 */
export function useCachedMission(missionId: string | null) {
  const { getMissionFromCache, cacheMissions } = useSessionContext();

  return useQuery({
    queryKey: ["missions", missionId],
    queryFn: async () => {
      if (!missionId) return null;

      // Vérifier d'abord le cache SessionProvider
      const cached = getMissionFromCache(missionId);
      if (cached) {
        return cached;
      }

      // Sinon, charger depuis Supabase
      const { getMissionById } = await import("@shiftly/data");
      const mission = await getMissionById(missionId);

      if (mission) {
        cacheMissions([mission]);
      }

      return mission;
    },
    enabled: !!missionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
