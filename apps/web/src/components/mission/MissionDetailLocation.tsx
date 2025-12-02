"use client";

import { YStack, Text } from "tamagui";
import { MapPin } from "lucide-react";
import { MissionMapView } from "@/components";
import type { Mission } from "@shiftly/data";

interface MissionDetailLocationProps {
  mission: Mission;
}

export function MissionDetailLocation({ mission }: MissionDetailLocationProps) {
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
      <YStack alignItems="center" gap="$2" marginBottom="$3" flexDirection="row">
        <MapPin size={20} color="#000" />
        <Text fontSize={18} fontWeight="bold" color="#000">
          Localisation
        </Text>
      </YStack>
      <Text fontSize={14} color="#666" marginBottom="$2">
        {mission.address || "85 boulevard brune"}
      </Text>
      <Text fontSize={14} color="#666" marginBottom="$3">
        {mission.postal_code || "75000"} {mission.city || "Paris"}
      </Text>
      <MissionMapView
        missions={[mission]}
        onMissionClick={() => {}}
        latitude={mission.latitude || 48.8566}
        longitude={mission.longitude || 2.3522}
        zoom={15}
        height={300}
      />
    </YStack>
  );
}

