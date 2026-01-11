"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/providers/SessionProvider";

/**
 * Hook pour gérer la redirection automatique selon l'état d'authentification
 * Redirige vers /login si non connecté, ou vers /home ou /commercial selon le rôle
 */
export function useAuthRedirect() {
  const router = useRouter();
  const { cache, isLoading, isInitialized } = useSessionContext();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected.current) return;

    // Attendre que le SessionProvider soit initialisé et ait fini de charger
    // isInitialized = true signifie que le chargement initial est terminé
    if (!isInitialized || isLoading) {
      return;
    }

    // À ce stade, le cache est chargé (ou null s'il n'y a pas de session)

    // Cas 1 : Pas de session ou pas d'user → rediriger vers login
    if (!cache?.session || !cache?.user) {
      hasRedirected.current = true;
      router.replace("/login");
      return;
    }

    // Cas 2 : Session et user existent, mais pas de profil → rediriger vers register
    // (nouveau compte qui n'a pas encore complété son profil)
    if (!cache.profile) {
      hasRedirected.current = true;
      router.replace("/register");
      return;
    }

    // Cas 3 : Session, user et profile existent → rediriger selon le rôle
    hasRedirected.current = true;
    if (cache.profile.role === "commercial") {
      router.replace("/commercial");
    } else {
      router.replace("/home");
    }
  }, [cache, isLoading, isInitialized, router]);
}
