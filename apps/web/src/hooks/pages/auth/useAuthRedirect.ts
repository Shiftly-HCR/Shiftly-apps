"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCurrentProfile } from "@/hooks/queries";

export function useAuthRedirect() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isAuthResolved,
    isUnauthenticated,
    isProfileMissing,
  } = useCurrentProfile();

  useEffect(() => {
    if (hasRedirected.current) return;

    if (!isAuthResolved) return;
    if (isLoadingProfile) return;

    if (isUnauthenticated) {
      hasRedirected.current = true;
      router.replace("/login");
      return;
    }

    if (isProfileMissing || !profile) {
      hasRedirected.current = true;
      // Registration disabled temporarily; redirect to login
      router.replace("/login");
      return;
    }

    // 👉 garde ici tes redirects existants selon profile.role si tu en avais
  }, [
    profile,
    isLoadingProfile,
    isAuthResolved,
    isUnauthenticated,
    isProfileMissing,
    router,
  ]);
}
