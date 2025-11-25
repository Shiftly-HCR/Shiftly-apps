"use client";

import { YStack, Text } from "tamagui";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@shiftly/ui";
import { getCurrentProfile } from "@shiftly/data";
import { AppLayout } from "../../components/AppLayout";
import RecruiterMissionsPage from "./recruiter/page";
import FreelanceMissionsPage from "./freelance/page";

export default function MissionsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Déterminer le rôle de l'utilisateur
  useEffect(() => {
    const checkUserRole = async () => {
      const profile = await getCurrentProfile();
      if (profile?.role) {
        setUserRole(profile.role);
      } else {
        // Par défaut, considérer comme recruteur si pas de rôle défini
        setUserRole("recruiter");
      }
      setIsLoading(false);
    };

    checkUserRole();
  }, []);

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

