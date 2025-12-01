"use client";

import { YStack, Text } from "tamagui";
import { useRouter } from "next/navigation";
import { colors } from "@shiftly/ui";
import { AppLayout } from "@/components";
import { useCurrentProfile } from "@/hooks";
import RecruiterMissionsPage from "./recruiter/page";
import FreelanceMissionsPage from "./freelance/page";

export default function MissionsPage() {
  const router = useRouter();
  const { profile, isLoading } = useCurrentProfile();
  const userRole = profile?.role || "recruiter";

  if (isLoading) {
    return (
      <AppLayout>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="$4"
        >
          <Text fontSize={16} color={colors.gray700}>
            Chargement...
          </Text>
        </YStack>
      </AppLayout>
    );
  }

  // Router vers la bonne page selon le rôle
  if (userRole === "freelance") {
    return <FreelanceMissionsPage />;
  }

  // Par défaut, afficher la page recruteur
  return <RecruiterMissionsPage />;
}
