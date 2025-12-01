"use client";

import { YStack } from "tamagui";
import { FreelanceProfileAbout } from "./FreelanceProfileAbout";
import { FreelanceSkills } from "./FreelanceSkills";
import { FreelanceExperiences } from "./FreelanceExperiences";
import { FreelanceEducations } from "./FreelanceEducations";
import type {
  Profile,
  FreelanceProfile,
  FreelanceExperience,
  FreelanceEducation,
} from "@shiftly/data";

interface FreelanceProfileOverviewProps {
  profile: Profile | FreelanceProfile;
  experiences: FreelanceExperience[];
  educations: FreelanceEducation[];
}

/**
 * Composant pour afficher le contenu de l'onglet "Aperçu" du profil freelance
 */
export function FreelanceProfileOverview({
  profile,
  experiences,
  educations,
}: FreelanceProfileOverviewProps) {
  return (
    <YStack gap="$6">
      {/* À propos */}
      <FreelanceProfileAbout profile={profile} />

      {/* Compétences */}
      {"skills" in profile && (
        <FreelanceSkills skills={profile.skills} />
      )}

      {/* Expériences */}
      <FreelanceExperiences experiences={experiences} />

      {/* Formations */}
      <FreelanceEducations educations={educations || []} />
    </YStack>
  );
}

