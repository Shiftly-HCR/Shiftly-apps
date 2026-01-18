"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentProfile,
  updateProfile,
  getProfileById,
  type Profile,
} from "@shiftly/data";

/**
 * Hook pour récupérer le profil de l'utilisateur actuel
 */
export function useCurrentProfile() {
  return useQuery({
    queryKey: ["profile", "current"],
    queryFn: getCurrentProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook pour récupérer un profil par ID
 */
export function useProfile(profileId: string | null) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => (profileId ? getProfileById(profileId) : null),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour mettre à jour le profil
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (result) => {
      if (result.success && result.profile) {
        // Mettre à jour le cache du profil actuel
        queryClient.setQueryData(["profile", "current"], result.profile);
        // Mettre à jour aussi le cache par ID si présent
        queryClient.setQueryData(["profile", result.profile.id], result.profile);
        // Invalider les queries liées
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    },
  });
}
