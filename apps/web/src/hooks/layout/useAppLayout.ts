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
      const result = await signOut();

      if (!result.success) {
        console.error("Erreur lors de la déconnexion:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Vider le cache et rediriger systématiquement
      await clear();
      router.replace("/login");
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
