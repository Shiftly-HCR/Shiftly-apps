"use client";

import { YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";

export function MissionActivityTab() {
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
        Journal d'activité
      </Text>
      <Text fontSize={14} color={colors.gray700}>
        Fonctionnalité à venir
      </Text>
    </YStack>
  );
}

