"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { type FreelanceExperience } from "@shiftly/data";

interface FreelanceExperiencesProps {
  experiences: FreelanceExperience[];
}

export function FreelanceExperiences({
  experiences,
}: FreelanceExperiencesProps) {
  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <YStack gap="$3">
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        Expériences
      </Text>
      <YStack gap="$4" position="relative" paddingLeft="$4">
        {/* Ligne verticale */}
        <YStack
          position="absolute"
          left={8}
          top={0}
          bottom={0}
          width={2}
          backgroundColor={colors.shiftlyViolet}
        />

        {experiences.map((exp, index) => (
          <XStack key={exp.id || index} gap="$3" alignItems="flex-start">
            {/* Icône */}
            <YStack
              width={16}
              height={16}
              borderRadius={8}
              backgroundColor={colors.shiftlyViolet}
              borderWidth={2}
              borderColor={colors.white}
              marginTop={2}
              flexShrink={0}
              zIndex={10}
            />

            {/* Contenu */}
            <YStack flex={1} gap="$1">
              <Text fontSize={18} fontWeight="600" color={colors.gray900}>
                {exp.title}
              </Text>
              <Text fontSize={16} color={colors.gray700} fontWeight="500">
                {exp.company}
                {exp.location && `, ${exp.location}`}
              </Text>
              <Text fontSize={14} color={colors.gray500}>
                {formatDate(exp.start_date)}
                {exp.end_date
                  ? ` - ${formatDate(exp.end_date)}`
                  : exp.is_current
                    ? " - Aujourd'hui"
                    : ""}
              </Text>
              {exp.description && (
                <Text fontSize={14} color={colors.gray700} marginTop="$2">
                  {exp.description}
                </Text>
              )}
            </YStack>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
