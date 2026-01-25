"use client";

import { XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { Mission } from "@shiftly/data";

interface MissionDetailHeaderProps {
  mission: Mission;
}

export function MissionDetailHeader({ mission }: MissionDetailHeaderProps) {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="baseline"
      marginBottom="$4"
      flexWrap="wrap"
      gap="$3"
    >
      <Text fontSize={32} fontWeight="bold" color="#000" flex={1}>
        {mission.title}
      </Text>
      <Text fontSize={32} fontWeight="bold" color={colors.shiftlyViolet}>
        {mission.total_salary}€
      </Text>
    </XStack>
  );
}
