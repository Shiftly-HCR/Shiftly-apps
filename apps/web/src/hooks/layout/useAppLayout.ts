"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useCurrentProfile } from "@/hooks";
import { useSessionContext } from "@/providers/SessionProvider";
import { signOut } from "@shiftly/data";

/**
 * Hook pour gérer la logique du layout de l'application
 * Gère l'authentification, la redirection et la déconnexion
 */
export function useAppLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
      // 1. Vider le cache React Query (inclut les données persistées dans localStorage)
      queryClient.clear();

      // 2. Vider aussi le localStorage pour le persister React Query
      // Le persister utilise une clé spécifique pour stocker les données
      if (typeof window !== "undefined") {
        // Vider toutes les clés liées à React Query
        // Le persister utilise généralement des clés comme "REACT_QUERY_OFFLINE_CACHE" ou "tanstack-query"
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (
            key &&
            (key.includes("REACT_QUERY") ||
              key.includes("react-query") ||
              key.includes("tanstack-query") ||
              key.includes("tanstack"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      }

      // 3. Vider le cache du SessionProvider AVANT la déconnexion
      // pour éviter que le SessionProvider ne recharge automatiquement une session encore présente
      await clear();

      // 4. Déconnecter de Supabase
      const result = await signOut();

      if (!result.success) {
        console.error("Erreur lors de la déconnexion:", result.error);
      }

      // 5. Utiliser window.location.href pour forcer un rechargement complet
      // Cela garantit que toutes les données sont vidées et que le cache Next.js est invalidé
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur, vider tous les caches et rediriger
      queryClient.clear();
      await clear();
      if (typeof window !== "undefined") {
        // Vider le localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (
            key &&
            (key.includes("REACT_QUERY") ||
              key.includes("react-query") ||
              key.includes("tanstack-query") ||
              key.includes("tanstack"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
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
