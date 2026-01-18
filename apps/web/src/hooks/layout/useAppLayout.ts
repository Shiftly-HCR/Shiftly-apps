"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useCurrentProfile, useSignOut } from "@/hooks/queries";

/**
 * Hook pour gérer la logique du layout de l'application
 * Gère l'authentification, la redirection et la déconnexion
 */
export function useAppLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const signOutMutation = useSignOut();
  const isLoading = isLoadingUser || isLoadingProfile;

  // Rediriger vers login si pas d'utilisateur
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      // Déconnecter de Supabase (le hook useSignOut gère déjà le nettoyage du cache)
      await signOutMutation.mutateAsync();

      // Utiliser window.location.href pour forcer un rechargement complet
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, vider tous les caches et rediriger
      queryClient.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return {
    user,
    profile,
    isLoading,
    searchValue,
    setSearchValue,
    handleLogout,
  };
}
