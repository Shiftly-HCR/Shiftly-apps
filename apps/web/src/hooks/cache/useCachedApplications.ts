"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserApplications, getMissionApplications } from "@shiftly/core";
import type {
  MissionApplicationWithMission,
  MissionApplicationWithProfile,
} from "@shiftly/data";

/**
 * Hook pour récupérer les candidatures d'un utilisateur avec cache React Query
 *
 * Ce hook utilise React Query pour mettre en cache les candidatures et éviter
 * les requêtes Supabase redondantes. Les données sont partagées entre tous
 * les composants qui utilisent ce hook avec le même userId.
 *
 * Note: staleTime plus court (2 minutes) car les candidatures peuvent changer
 * plus fréquemment que les missions ou profils.
 *
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur actuel si non fourni)
 * @returns Les candidatures de l'utilisateur, l'état de chargement et les erreurs
 */
export function useCachedUserApplications(userId?: string) {
  return useQuery({
    queryKey: ["applications", "user", userId],
    queryFn: async () => {
      const result = await getUserApplications(userId);
      if (result.success) {
        return result.applications || [];
      }
      throw new Error(
        result.error || "Erreur lors du chargement des candidatures"
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car données plus dynamiques)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour récupérer les candidatures d'une mission avec cache React Query
 *
 * Ce hook utilise React Query pour mettre en cache les candidatures d'une mission
 * et éviter les requêtes Supabase redondantes. Les données sont partagées entre
 * tous les composants qui utilisent ce hook avec le même missionId.
 *
 * Note: staleTime plus court (2 minutes) car les candidatures peuvent changer
 * plus fréquemment que les missions ou profils.
 *
 * @param missionId - ID de la mission
 * @returns Les candidatures de la mission, l'état de chargement et les erreurs
 */
export function useCachedMissionApplications(missionId: string | null) {
  return useQuery({
    queryKey: ["applications", "mission", missionId],
    queryFn: async () => {
      if (!missionId) return [];

      const result = await getMissionApplications(missionId);
      if (result.success) {
        return result.applications || [];
      }
      throw new Error(
        result.error || "Erreur lors du chargement des candidatures"
      );
    },
    enabled: !!missionId,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car données plus dynamiques)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
