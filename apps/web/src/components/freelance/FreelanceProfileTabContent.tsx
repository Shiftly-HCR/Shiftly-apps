"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { FreelanceProfileOverview } from "./FreelanceProfileOverview";
import type {
  Profile,
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
} from "@shiftly/data";

type TabType = "overview" | "availability" | "reviews" | "documents";

interface FreelanceProfileTabContentProps {
  activeTab: TabType;
  profile: Profile | FreelanceProfile;
  experiences: FreelanceExperience[];
  educations: FreelanceEducation[];
}

/**
 * Composant pour afficher le contenu des différents onglets du profil freelance
 */
export function FreelanceProfileTabContent({
  activeTab,
  profile,
  experiences,
  educations,
}: FreelanceProfileTabContentProps) {
  if (activeTab === "overview") {
    return (
      <FreelanceProfileOverview
        profile={profile}
        experiences={experiences}
        educations={educations}
      />
    );
  }

  if (activeTab === "availability") {
    return (
      <YStack
        gap="$4"
        padding="$4"
        backgroundColor={colors.white}
        borderRadius={12}
      >
        <Text fontSize={16} color={colors.gray700}>
          Les disponibilités seront affichées ici.
        </Text>
      </YStack>
    );
  }

  // TODO: Feature not ready yet
  // if (activeTab === "reviews") {
  //   return (
  //     <YStack
  //       gap="$4"
  //       padding="$4"
  //       backgroundColor={colors.white}
  //       borderRadius={12}
  //     >
  //       <Text fontSize={16} color={colors.gray700}>
  //         Les avis seront affichés ici.
  //       </Text>
  //     </YStack>
  //   );
  // }

  // TODO: Feature not ready yet
  // if (activeTab === "documents") {
  //   return (
  //     <YStack
  //       gap="$4"
  //       padding="$4"
  //       backgroundColor={colors.white}
  //       borderRadius={12}
  //     >
  //       <Text fontSize={16} color={colors.gray700}>
  //         Les documents seront affichés ici.
  //       </Text>
  //     </YStack>
  //   );
  // }

  return (
    <YStack
      gap="$2"
      padding="$4"
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
    >
      <Text fontSize={16} color={colors.gray700}>
        Contenu indisponible pour cet onglet.
      </Text>
    </YStack>
  );
}
