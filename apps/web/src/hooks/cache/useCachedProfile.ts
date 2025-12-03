"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/providers/SessionProvider";
import {
  getProfileById,
  getFreelanceProfileById,
  type Profile,
  type FreelanceProfile,
} from "@shiftly/data";

/**
 * Hook pour récupérer un profil avec cache React Query
 * 
 * Ce hook utilise React Query pour mettre en cache les profils et éviter
 * les requêtes Supabase redondantes. Vérifie d'abord le cache SessionProvider,
 * puis fait une requête Supabase si nécessaire.
 * 
 * @param profileId - ID du profil à récupérer
 * @returns Le profil, l'état de chargement et les erreurs
 */
export function useCachedProfile(profileId: string | null) {
  const { getProfileFromCache, cacheProfiles } = useSessionContext();

  return useQuery({
    queryKey: ["profiles", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      // 1. Vérifier le cache SessionProvider d'abord
      const cached = getProfileFromCache(profileId);
      if (cached) {
        return cached;
      }

      // 2. Si pas dans le cache, charger depuis Supabase
      // Essayer d'abord comme profil freelance
      let loadedProfile: Profile | FreelanceProfile | null =
        await getFreelanceProfileById(profileId);
      
      // Si pas trouvé, essayer comme profil normal
      if (!loadedProfile) {
        loadedProfile = await getProfileById(profileId);
      }

      if (loadedProfile) {
        // Mettre en cache dans SessionProvider
        cacheProfiles([loadedProfile]);
      }

      return loadedProfile;
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

