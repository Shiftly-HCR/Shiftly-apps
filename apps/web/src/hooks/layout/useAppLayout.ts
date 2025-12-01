"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useCurrentProfile } from "@/hooks";
import { useSessionContext } from "@/providers/SessionProvider";
import { signOut } from "@shiftly/data";

/**
 * Hook pour gérer la logique du layout de l'application
 * Gère l'authentification, la redirection et la déconnexion
 */
export function useAppLayout() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const { user, isLoading: isLoadingUser } = useCurrentUser();
  const { profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const { clear } = useSessionContext();
  const isLoading = isLoadingUser || isLoadingProfile;

  // Rediriger vers login si pas d'utilisateur
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      // Déconnecter de Supabase
      const result = await signOut();

      if (result.success) {
        // Vider le cache
        await clear();
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Vider le cache même en cas d'erreur
      await clear();
      router.push("/login");
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

