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

  // Récupérer le cache SessionProvider pour l'utiliser comme placeholderData
  const cachedProfile = profileId ? getProfileFromCache(profileId) : null;

  return useQuery({
    queryKey: ["profiles", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      // TOUJOURS charger depuis Supabase (React Query gère le cache interne)
      // Essayer d'abord comme profil freelance
      let loadedProfile: Profile | FreelanceProfile | null =
        await getFreelanceProfileById(profileId);

      // Si pas trouvé, essayer comme profil normal
      if (!loadedProfile) {
        loadedProfile = await getProfileById(profileId);
      }

      if (loadedProfile) {
        // Mettre en cache dans SessionProvider pour compatibilité
        cacheProfiles([loadedProfile]);
      }

      return loadedProfile;
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    // Utiliser le cache SessionProvider comme placeholderData pour un affichage immédiat
    // mais React Query chargera toujours depuis Supabase pour avoir les données à jour
    placeholderData: cachedProfile || undefined,
    // S'assurer que React Query charge toujours, même avec placeholderData
    refetchOnMount: true,
  });
}
