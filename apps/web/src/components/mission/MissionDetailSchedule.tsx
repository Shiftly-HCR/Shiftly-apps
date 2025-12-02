"use client";

import { YStack, XStack, Text } from "tamagui";
import { Calendar, Clock } from "lucide-react";
import { colors } from "@shiftly/ui";
import type { Mission } from "@shiftly/data";

interface MissionDetailScheduleProps {
  mission: Mission;
  formatDateShort: (startDate?: string, endDate?: string) => string;
}

export function MissionDetailSchedule({
  mission,
  formatDateShort,
}: MissionDetailScheduleProps) {
  const startDate = mission.start_date
    ? new Date(mission.start_date)
    : new Date("2024-07-17");
  const day = startDate.getDate();
  const month = startDate.toLocaleDateString("fr-FR", { month: "short" });

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      padding="$5"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      gap="$4"
    >
      <Text fontSize={18} fontWeight="bold" color="#000">
        Horaires et durée
      </Text>

      {/* Dates avec icône calendrier */}
      <XStack gap="$3" alignItems="center">
        <YStack
          backgroundColor={colors.shiftlyVioletLight}
          borderRadius={8}
          padding="$3"
          alignItems="center"
          justifyContent="center"
          minWidth={70}
          minHeight={70}
        >
          <Calendar size={24} color={colors.shiftlyViolet} />
          <Text
            fontSize={28}
            fontWeight="bold"
            color={colors.shiftlyViolet}
            marginTop="$1"
          >
            {day}
          </Text>
          <Text fontSize={12} color="#666" textTransform="capitalize">
            {month}
          </Text>
        </YStack>

        <YStack flex={1}>
          <Text
            fontSize={14}
            fontWeight="600"
            color="#000"
            marginBottom="$1"
          >
            Dates
          </Text>
          <Text fontSize={14} color="#666">
            {formatDateShort(mission.start_date, mission.end_date)}
          </Text>
        </YStack>
      </XStack>

      {/* Horaires avec icône horloge */}
      <XStack alignItems="center" gap="$3">
        <YStack
          width={70}
          height={70}
          alignItems="center"
          justifyContent="center"
        >
          <Clock size={40} color={colors.shiftlyViolet} />
        </YStack>
        <YStack flex={1}>
          <Text
            fontSize={14}
            fontWeight="600"
            color="#000"
            marginBottom="$1"
          >
            Horaires
          </Text>
          <Text fontSize={14} color="#666">
            {mission.start_time && mission.end_time
              ? `${mission.start_time} - ${mission.end_time}`
              : "Horaires non définis"}
          </Text>
          <Text fontSize={12} color="#999" marginTop="$1">
            Service de restaurant
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
}

