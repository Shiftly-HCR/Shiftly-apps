"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { type Mission } from "@shiftly/data";

interface MissionDetailsTabProps {
  mission: Mission;
}

export function MissionDetailsTab({ mission }: MissionDetailsTabProps) {
  return (
    <YStack
      backgroundColor={colors.white}
      borderRadius={12}
      padding="$6"
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$4"
    >
      <Text fontSize={20} fontWeight="700" color={colors.gray900}>
        Détails de la mission
      </Text>
      <YStack gap="$3">
        <Text fontSize={14} color={colors.gray700} lineHeight={22}>
          {mission.description || "Aucune description disponible"}
        </Text>
        {mission.skills && mission.skills.length > 0 && (
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="600" color={colors.gray900}>
              Compétences requises :
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {mission.skills.map((skill, index) => (
                <XStack
                  key={index}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={20}
                  backgroundColor={colors.shiftlyVioletLight}
                >
                  <Text
                    fontSize={12}
                    color={colors.shiftlyViolet}
                    fontWeight="600"
                  >
                    {skill}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}

