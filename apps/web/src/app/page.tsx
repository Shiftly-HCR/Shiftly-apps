"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { PageLoading } from "@/components";
import { useCurrentProfile } from "@/hooks/queries";
import { useCurrentUser } from "@/hooks/profile/useCurrentUser";

export default function Home() {
  const router = useRouter();
  const { isLoading: isLoadingUser } = useCurrentUser();
  const {
    isLoading: isLoadingProfile,
    isAuthResolved,
    isUnauthenticated,
  } = useCurrentProfile();
  const isLoading = isLoadingUser || isLoadingProfile || !isAuthResolved;

  useEffect(() => {
    if (!isLoading && !isUnauthenticated) {
      router.replace("/home");
    }
  }, [isLoading, isUnauthenticated, router]);

  if (isLoading || !isUnauthenticated) {
    return <PageLoading />;
  }

  return <LandingPage />;
}
