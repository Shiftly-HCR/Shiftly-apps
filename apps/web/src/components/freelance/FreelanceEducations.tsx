"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { type FreelanceEducation } from "@shiftly/data";
import { useFormatDate } from "@/hooks";

interface FreelanceEducationsProps {
  educations: FreelanceEducation[];
}

export function FreelanceEducations({ educations }: FreelanceEducationsProps) {
  const { formatDateShort } = useFormatDate();

  if (!educations || educations.length === 0) {
    console.log("⚠️ FreelanceEducations - Aucune formation, retour null");
    return null;
  }

  return (
    <YStack gap="$3">
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        Formations
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

        {educations.map((edu, index) => (
          <XStack key={edu.id || index} gap="$3" alignItems="flex-start">
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
                {edu.school}
              </Text>
              {edu.degree && (
                <Text fontSize={16} color={colors.gray700} fontWeight="500">
                  {edu.degree}
                  {edu.field && ` - ${edu.field}`}
                </Text>
              )}
              <Text fontSize={14} color={colors.gray500}>
                {formatDateShort(edu.start_date)}
                {edu.end_date ? ` - ${formatDateShort(edu.end_date)}` : ""}
              </Text>
            </YStack>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
