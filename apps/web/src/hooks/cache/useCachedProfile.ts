"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "@/providers/SessionProvider";
import {
  getProfileById,
  getFreelanceProfileById,
  type Profile,
  type FreelanceProfile,
} from "@shiftly/data";

/**
 * Hook pour récupérer un profil avec cache
 * Vérifie d'abord le cache, puis fait une requête Supabase si nécessaire
 */
export function useCachedProfile(profileId: string | null) {
  const { getProfileFromCache, cacheProfiles } = useSessionContext();
  const [profile, setProfile] = useState<Profile | FreelanceProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      // 1. Vérifier le cache d'abord
      const cached = getProfileFromCache(profileId);
      if (cached) {
        setProfile(cached);
        setIsLoading(false);
        return;
      }

      // 2. Si pas dans le cache, charger depuis Supabase
      try {
        // Essayer d'abord comme profil freelance
        let loadedProfile: Profile | FreelanceProfile | null =
          await getFreelanceProfileById(profileId);
        
        // Si pas trouvé, essayer comme profil normal
        if (!loadedProfile) {
          loadedProfile = await getProfileById(profileId);
        }

        if (loadedProfile) {
          setProfile(loadedProfile);
          // Mettre en cache
          cacheProfiles([loadedProfile]);
        } else {
          setError("Profil non trouvé");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [profileId, getProfileFromCache, cacheProfiles]);

  return { profile, isLoading, error };
}

