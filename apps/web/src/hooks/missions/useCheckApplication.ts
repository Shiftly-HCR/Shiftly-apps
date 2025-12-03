"use client";

import { useQuery } from "@tanstack/react-query";
import { checkApplicationExists } from "@shiftly/data";
import { useSessionCache } from "@/hooks/cache/useSessionCache";

/**
 * Hook pour vérifier si l'utilisateur a déjà postulé à une mission
 * 
 * Utilise le cache de session pour récupérer l'utilisateur au lieu
 * d'appeler directement supabase.auth.getUser()
 */
export function useCheckApplication(missionId: string | null) {
  const { cache } = useSessionCache();
  const userId = cache?.user?.id;

  return useQuery({
    queryKey: ["applications", "check", missionId, userId],
    queryFn: async () => {
      if (!missionId || !userId) {
        return false;
      }

      return await checkApplicationExists(missionId, userId);
    },
    enabled: !!missionId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car peut changer rapidement)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

