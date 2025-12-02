"use client";

import { XStack, Text } from "tamagui";
import { MapPin } from "lucide-react";
import type { Mission } from "@shiftly/data";

interface MissionDetailLocationHeaderProps {
  mission: Mission;
}

export function MissionDetailLocationHeader({
  mission,
}: MissionDetailLocationHeaderProps) {
  return (
    <XStack alignItems="center" gap="$2" marginBottom="$6">
      <MapPin size={16} color="#666" />
      <Text fontSize={16} color="#666">
        {mission.city || mission.address || "Paris"}
      </Text>
    </XStack>
  );
}

