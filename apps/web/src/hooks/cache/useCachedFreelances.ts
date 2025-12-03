"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublishedFreelances, type FreelanceProfile } from "@shiftly/data";
import { useSessionContext } from "@/providers/SessionProvider";

/**
 * Hook pour récupérer toutes les freelances publiées avec cache React Query
 * 
 * Ce hook utilise React Query pour mettre en cache les freelances et éviter
 * les requêtes Supabase redondantes. Les données sont partagées entre tous
 * les composants qui utilisent ce hook.
 * 
 * @returns Les freelances publiées, l'état de chargement et les erreurs
 */
export function useCachedFreelances() {
  const { cacheProfiles } = useSessionContext();

  return useQuery({
    queryKey: ["freelances", "published"],
    queryFn: async () => {
      const freelances = await getPublishedFreelances();
      
      // Mettre en cache dans SessionProvider pour compatibilité
      if (freelances.length > 0) {
        cacheProfiles(freelances);
      }
      
      return freelances;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

