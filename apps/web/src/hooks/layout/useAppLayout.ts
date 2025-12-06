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
      // 1. Vider le cache AVANT la déconnexion pour éviter que le SessionProvider
      // ne recharge automatiquement une session encore présente
      await clear();

      // 2. Déconnecter de Supabase
      const result = await signOut();

      if (!result.success) {
        console.error("Erreur lors de la déconnexion:", result.error);
      }

      // 3. Vérifier que la session est bien supprimée
      // Attendre un peu pour que Supabase termine la déconnexion
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 4. Rediriger vers /login
      router.replace("/login");

      // 5. Fallback hard redirect pour éviter tout état React coincé
      if (typeof window !== "undefined") {
        // Petit délai pour s'assurer que tout est bien nettoyé
        setTimeout(() => {
          window.location.href = "/login";
        }, 50);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, vider le cache et rediriger
      await clear();
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
