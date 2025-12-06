"use client";

import { YStack } from "tamagui";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components";
import { useCurrentProfile } from "@/hooks";
import RecruiterMissionsPage from "./recruiter/page";
import FreelanceMissionsPage from "./freelance/page";

export default function MissionsPage() {
  const router = useRouter();
  const { profile, isLoading } = useCurrentProfile();
  const userRole = profile?.role || "recruiter";

  if (isLoading) {
    return <PageLoading />;
  }

  // Router vers la bonne page selon le rôle
  if (userRole === "freelance") {
    return <FreelanceMissionsPage />;
  } else {
    return <RecruiterMissionsPage />;
  }
}
