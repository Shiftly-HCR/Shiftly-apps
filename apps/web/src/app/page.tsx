"use client";

import { LandingPage } from "@/components/landing/LandingPage";
import { PageLoading } from "@/components";
import { useCurrentProfile } from "@/hooks/queries";
import { useCurrentUser } from "@/hooks/profile/useCurrentUser";

export default function Home() {
  const { isLoading: isLoadingUser } = useCurrentUser();
  const { isLoading: isLoadingProfile, isAuthResolved } = useCurrentProfile();
  const isLoading = isLoadingUser || isLoadingProfile || !isAuthResolved;

  if (isLoading) {
    return <PageLoading />;
  }

  return <LandingPage />;
}
