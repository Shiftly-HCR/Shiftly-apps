"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/providers/SessionProvider";
import {
  getFreelanceExperiencesById,
  getFreelanceEducationsById,
  type FreelanceExperience,
  type FreelanceEducation,
} from "@shiftly/data";

/**
 * Hook pour récupérer les données freelance (expériences + formations) avec cache React Query
 * 
 * Ce hook utilise React Query pour mettre en cache les expériences et formations
 * d'un freelance, évitant les requêtes Supabase redondantes.
 * 
 * @param userId - ID de l'utilisateur freelance
 * @returns Les expériences, formations, l'état de chargement et les erreurs
 */
export function useCachedFreelanceData(userId: string | null) {
  const {
    getFreelanceExperiencesFromCache,
    getFreelanceEducationsFromCache,
    cacheFreelanceExperiences,
    cacheFreelanceEducations,
  } = useSessionContext();

  // Query pour les expériences
  const experiencesQuery = useQuery({
    queryKey: ["freelance", userId, "experiences"],
    queryFn: async () => {
      if (!userId) return [];

      // Vérifier le cache SessionProvider d'abord
      const cached = getFreelanceExperiencesFromCache(userId);
      if (cached.length > 0) {
        return cached;
      }

      // Charger depuis Supabase
      const experiences = await getFreelanceExperiencesById(userId);
      
      // Mettre en cache (même si vide pour éviter de recharger inutilement)
      cacheFreelanceExperiences(userId, experiences);
      
      return experiences;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Query pour les formations
  const educationsQuery = useQuery({
    queryKey: ["freelance", userId, "educations"],
    queryFn: async () => {
      if (!userId) return [];

      // Vérifier le cache SessionProvider d'abord
      const cached = getFreelanceEducationsFromCache(userId);
      if (cached.length > 0) {
        return cached;
      }

      // Charger depuis Supabase
      const educations = await getFreelanceEducationsById(userId);
      
      // Mettre en cache (même si vide pour éviter de recharger inutilement)
      cacheFreelanceEducations(userId, educations);
      
      return educations;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    experiences: experiencesQuery.data || [],
    educations: educationsQuery.data || [],
    isLoading: experiencesQuery.isLoading || educationsQuery.isLoading,
    error: experiencesQuery.error || educationsQuery.error
      ? (experiencesQuery.error as Error)?.message || (educationsQuery.error as Error)?.message || "Erreur lors du chargement des données"
      : null,
  };
}

