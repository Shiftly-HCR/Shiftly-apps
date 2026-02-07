"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useCurrentProfile, useSignOut } from "@/hooks/queries";

const SEARCHABLE_PATHS = ["/home", "/freelance"] as const;

/**
 * Hook pour gérer la logique du layout de l'application
 * Gère l'authentification, la redirection, la déconnexion et la synchro recherche (URL ?q=)
 */
export function useAppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");

  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isAuthResolved,
    isUnauthenticated,
    // isProfileMissing, // dispo si tu veux gérer /register ici
  } = useCurrentProfile();

  const signOutMutation = useSignOut();

  const isLoading = isLoadingUser || isLoadingProfile;

  // Sync searchValue from URL when on a searchable page
  useEffect(() => {
    if (SEARCHABLE_PATHS.includes(pathname as (typeof SEARCHABLE_PATHS)[number])) {
      setSearchValue(searchParams.get("q") ?? "");
    }
  }, [pathname, searchParams]);

  // On search submit: update URL on /home or /freelance, else redirect to role-appropriate list with ?q=
  const handleSearchSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (SEARCHABLE_PATHS.includes(pathname as (typeof SEARCHABLE_PATHS)[number])) {
        const params = new URLSearchParams(searchParams.toString());
        if (trimmed) params.set("q", trimmed);
        else params.delete("q");
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      } else {
        const targetPath = profile?.role === "recruiter" ? "/freelance" : "/home";
        router.push(trimmed ? `${targetPath}?q=${encodeURIComponent(trimmed)}` : targetPath);
      }
    },
    [pathname, searchParams, profile?.role, router]
  );

  /**
   * Rediriger vers /login UNIQUEMENT quand on est certain que l'utilisateur
   * n'est pas authentifié (401). Ne pas rediriger pendant la phase "unknown"
   * au hard refresh.
   */
  useEffect(() => {
    // Tant qu'on ne sait pas si l'utilisateur est loggé ou non, on ne fait rien
    if (!isAuthResolved) return;

    // On attend la fin des chargements
    if (isLoading) return;

    // Redirect login seulement si backend dit "401 / non authentifié"
    if (isUnauthenticated) {
      router.replace("/login");
      return;
    }

    // IMPORTANT: ne plus faire `if (!user) router.push('/login')`
    // car `user` peut être null/undefined transitoirement au refresh.
  }, [isAuthResolved, isUnauthenticated, isLoading, router]);

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
    handleSearchSubmit,
    handleLogout,
  };
}
