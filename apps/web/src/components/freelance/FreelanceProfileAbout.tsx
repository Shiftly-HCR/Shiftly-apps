"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { Profile, FreelanceProfile } from "@shiftly/data";

interface FreelanceProfileAboutProps {
  profile: Profile | FreelanceProfile;
}

/**
 * Composant pour afficher la section "À propos" du profil freelance
 */
export function FreelanceProfileAbout({ profile }: FreelanceProfileAboutProps) {
  const aboutText =
    ("summary" in profile && profile.summary
      ? profile.summary
      : profile.bio) || "Aucune description disponible.";

  return (
    <YStack gap="$3">
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        À propos
      </Text>
      <Text fontSize={16} color={colors.gray700} lineHeight={24}>
        {aboutText}
      </Text>
    </YStack>
  );
}

