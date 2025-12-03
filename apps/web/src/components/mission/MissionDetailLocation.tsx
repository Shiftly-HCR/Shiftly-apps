"use client";

import { YStack, XStack, Text } from "tamagui";
import { MapPin } from "lucide-react";
import { MissionMapView } from "@/components";
import type { Mission } from "@shiftly/data";

interface MissionDetailLocationProps {
  mission: Mission;
}

// Fonctions utilitaires pour formater les dates et détecter les nouvelles missions
const formatDate = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return "Dates non définies";

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  if (startDate && endDate) {
    const start = new Date(startDate).toLocaleDateString("fr-FR", formatOptions);
    const end = new Date(endDate).toLocaleDateString("fr-FR", formatOptions);
    return `${start} - ${end}`;
  }

  if (startDate) {
    return `À partir du ${new Date(startDate).toLocaleDateString("fr-FR", formatOptions)}`;
  }

  return `Jusqu'au ${new Date(endDate!).toLocaleDateString("fr-FR", formatOptions)}`;
};

const isNewMission = (createdAt?: string) => {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 48;
};

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
      <XStack alignItems="center" gap="$2" marginBottom="$3">
        <MapPin size={20} color="#000" style={{ flexShrink: 0 }} />
        <Text fontSize={18} fontWeight="bold" color="#000">
          Localisation
        </Text>
      </XStack>
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
        formatDate={formatDate}
        isNewMission={isNewMission}
      />
    </YStack>
  );
}

