"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

interface FreelanceSkillsProps {
  skills?: string[];
}

/**
 * Composant pour afficher les compétences d'un freelance sous forme de badges
 */
export function FreelanceSkills({ skills }: FreelanceSkillsProps) {
  if (!skills || skills.length === 0) {
    return (
      <YStack gap="$2">
        <Text fontSize={20} fontWeight="700" color={colors.gray900}>
          Compétences
        </Text>
        <YStack
          padding="$3"
          backgroundColor={colors.white}
          borderRadius="$3"
          borderWidth={1}
          borderColor={colors.gray200}
        >
          <Text fontSize={14} color={colors.gray500}>
            Aucune compétence renseignée pour le moment.
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        Compétences
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        {skills.map((skill: string, index: number) => (
          <XStack
            key={index}
            paddingHorizontal="$3"
            paddingVertical="$2"
            backgroundColor={colors.white}
            borderRadius="$3"
            borderWidth={1}
            borderColor={colors.gray200}
          >
            <Text fontSize={14} color={colors.gray700} fontWeight="500">
              {skill}
            </Text>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}
