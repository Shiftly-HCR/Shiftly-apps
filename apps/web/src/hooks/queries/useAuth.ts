"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, signIn, signOut, signUp } from "@shiftly/data";
import type { User } from "@shiftly/data";

/**
 * Hook pour récupérer l'utilisateur actuel
 */
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    ...query,
    user: query.data ?? null,
    session: null,
  } as typeof query & {
    user: User | null;
    session: null;
  };
}

/**
 * Hook pour la connexion
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (result) => {
      if (result.success && result.user) {
        // Mettre à jour le cache de l'utilisateur
        queryClient.setQueryData(["auth", "user"], result.user);
        // Invalider toutes les queries pour recharger les données utilisateur
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["missions"] });
        queryClient.invalidateQueries({ queryKey: ["freelance"] });
      }
    },
  });
}

/**
 * Hook pour la déconnexion
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Vider tout le cache
      queryClient.clear();
      // Vider aussi le localStorage de React Query
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (
            key &&
            (key.includes("REACT_QUERY") ||
              key.includes("react-query") ||
              key.includes("tanstack"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      }
    },
  });
}

/**
 * Hook pour l'inscription
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (result) => {
      if (result.success && result.user) {
        queryClient.setQueryData(["auth", "user"], result.user);
      }
    },
  });
}
