"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, useCurrentProfile } from "@/hooks/queries";

/**
 * Hook pour gérer la redirection automatique selon l'état d'authentification
 * Redirige vers /login si non connecté, ou vers /home ou /commercial selon le rôle
 */
export function useAuthRedirect() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: profile, isLoading: isLoadingProfile } = useCurrentProfile();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected.current) return;

    // Attendre que les données soient chargées
    if (isLoadingUser || isLoadingProfile) {
      return;
    }

    // Cas 1 : Pas d'utilisateur → rediriger vers login
    if (!user) {
      hasRedirected.current = true;
      router.replace("/login");
      return;
    }

    // Cas 2 : Utilisateur existe mais pas de profil → rediriger vers register
    if (!profile) {
      hasRedirected.current = true;
      router.replace("/register");
      return;
    }

    // Cas 3 : Utilisateur et profil existent → rediriger selon le rôle
    hasRedirected.current = true;
    if (profile.role === "commercial") {
      router.replace("/commercial");
    } else {
      router.replace("/home");
    }
  }, [user, profile, isLoadingUser, isLoadingProfile, router]);
}
