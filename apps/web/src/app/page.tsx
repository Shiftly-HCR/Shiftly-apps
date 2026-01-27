"use client";

import { useCurrentProfile } from "@/hooks/queries";
import { PageLoading } from "@/components";
import FreelancePage from "./freelance/page";
import HomePage from "./home/page";

export default function Home() {
  const { data: profile, isLoading, isAuthResolved, isUnauthenticated, isProfileMissing } = useCurrentProfile();

  // Afficher un loader pendant le chargement ou tant que l'authentification n'est pas résolue
  if (!isAuthResolved || isLoading) {
    return <PageLoading />;
  }

  // Si non authentifié ou profil manquant, rediriger vers login/register (géré par AuthGuard)
  if (isUnauthenticated || isProfileMissing || !profile) {
    return <PageLoading />;
  }

  // Si recruteur, afficher la page freelance
  if (profile.role === "recruiter") {
    return <FreelancePage />;
  }

  // Sinon (freelance, commercial, etc.), afficher la page home avec les missions
  return <HomePage />;
}
