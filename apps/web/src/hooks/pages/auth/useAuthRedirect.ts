"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionCache } from "@/hooks/cache/useSessionCache";
import { getSession } from "@shiftly/data";

/**
 * Hook pour gérer la redirection automatique selon l'état d'authentification
 * Redirige vers /login si non connecté, ou vers /home ou /commercial selon le rôle
 */
export function useAuthRedirect() {
  const router = useRouter();
  const { cache, isLoading } = useSessionCache();
  const hasRedirected = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Éviter les redirections multiples
    if (hasRedirected.current) return;

    // Nettoyer le timeout précédent si nécessaire
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const performRedirect = async () => {
      // Attendre que le cache soit chargé
      if (isLoading) return;

      try {
        // Vérifier la session Supabase directement
        const session = await getSession();

        // Si pas de session Supabase, rediriger vers login
        if (!session) {
          hasRedirected.current = true;
          router.replace("/login");
          return;
        }

        // Si on a un cache avec user et profile, rediriger selon le rôle
        if (cache?.user && cache?.profile) {
          hasRedirected.current = true;
          if (cache.profile.role === "commercial") {
            router.replace("/commercial");
          } else {
            router.replace("/home");
          }
          return;
        }

        // Si on a une session mais pas encore de cache, attendre un peu
        // que le SessionProvider charge le cache (max 2 secondes)
        if (!cache && session) {
          // Le cache devrait se charger bientôt via le SessionProvider
          // On attend un peu puis on vérifie à nouveau
          timeoutRef.current = setTimeout(() => {
            // Vérifier à nouveau après l'attente
            // Le useEffect se déclenchera à nouveau quand cache changera
            if (!hasRedirected.current) {
              // Si après 2 secondes on n'a toujours pas de cache, rediriger vers login
              hasRedirected.current = true;
              router.replace("/login");
            }
          }, 2000);
          return;
        }

        // Cas par défaut : pas de cache ni de session valide → rediriger vers login
        hasRedirected.current = true;
        router.replace("/login");
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        hasRedirected.current = true;
        router.replace("/login");
      }
    };

    performRedirect();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [cache, isLoading, router]);
}
