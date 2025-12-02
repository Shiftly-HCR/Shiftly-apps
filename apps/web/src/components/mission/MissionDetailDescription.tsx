"use client";

import { YStack, Text } from "tamagui";
import type { Mission } from "@shiftly/data";

interface MissionDetailDescriptionProps {
  mission: Mission;
}

export function MissionDetailDescription({
  mission,
}: MissionDetailDescriptionProps) {
  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      padding="$5"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
    >
      <Text
        fontSize={18}
        fontWeight="bold"
        marginBottom="$3"
        color="#000"
      >
        Description de la mission
      </Text>
      <Text fontSize={14} color="#666" lineHeight={22}>
        {mission.description || "une mission classique de serveur"}
      </Text>
    </YStack>
  );
}

