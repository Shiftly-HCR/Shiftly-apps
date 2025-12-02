"use client";

import { YStack, Image } from "tamagui";
import type { Mission } from "@shiftly/data";

interface MissionDetailImageProps {
  mission: Mission;
}

export function MissionDetailImage({ mission }: MissionDetailImageProps) {
  if (!mission.image_url) return null;

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      overflow="hidden"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
    >
      <Image
        source={{ uri: mission.image_url }}
        width="100%"
        height={400}
        resizeMode="cover"
      />
    </YStack>
  );
}

