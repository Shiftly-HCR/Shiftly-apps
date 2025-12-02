"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentProfile } from "@/hooks";

/**
 * Hook pour protéger une route selon le rôle de l'utilisateur
 * Redirige vers /home si le rôle ne correspond pas
 */
export function useRequireRole(requiredRole: string) {
  const router = useRouter();
  const { profile, isLoading } = useCurrentProfile();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!profile) {
      // Pas de profil = pas connecté, rediriger vers login
      router.push("/login");
      return;
    }

    if (profile.role !== requiredRole) {
      // Rôle incorrect, rediriger vers home
      router.push("/home");
      return;
    }

    // Rôle correct
    setIsAuthorized(true);
  }, [profile, isLoading, requiredRole, router]);

  return {
    isAuthorized,
    isLoading,
    profile,
  };
}

