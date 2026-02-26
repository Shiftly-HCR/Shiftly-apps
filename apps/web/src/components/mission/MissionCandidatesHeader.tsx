"use client";

import { YStack, XStack, Text } from "tamagui";
import { type Mission } from "@shiftly/data";
import { colors } from "@shiftly/ui";
import { useResponsive } from "@/hooks";

interface MissionCandidatesHeaderProps {
  mission: Mission;
}

export function MissionCandidatesHeader({
  mission,
}: MissionCandidatesHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <YStack
      backgroundColor={colors.white}
      borderRadius={12}
      padding={isMobile ? "$4" : "$5"}
      borderWidth={1}
      borderColor={colors.gray200}
      gap="$4"
    >
      <XStack
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        flexDirection={isMobile ? "column" : "row"}
        gap="$4"
      >
        <YStack flex={1} gap="$2" width={isMobile ? "100%" : undefined}>
          <Text fontSize={28} fontWeight="700" color={colors.gray900}>
            {mission.title}
          </Text>
          <Text fontSize={16} color={colors.gray700}>
            {mission.city || mission.address || "Localisation non définie"}
          </Text>
        </YStack>
        <XStack
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={20}
          backgroundColor={
            mission.status === "published" ? "#10B981" : colors.gray500
          }
        >
          <Text fontSize={14} color={colors.white} fontWeight="600">
            {mission.status === "published" ? "Publiée" : mission.status}
          </Text>
        </XStack>
      </XStack>

      {/* Informations rapides */}
      <XStack gap="$4" flexWrap="wrap">
        {mission.start_date && (
          <XStack alignItems="center" gap="$2">
            <Text fontSize={18}>📅</Text>
            <Text fontSize={14} color={colors.gray700}>
              {new Date(mission.start_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
              {mission.start_time && `, ${mission.start_time}`}
              {mission.end_time && `-${mission.end_time}`}
            </Text>
          </XStack>
        )}
        {mission.hourly_rate && (
          <XStack alignItems="center" gap="$2">
            <Text fontSize={18}>💰</Text>
            <Text fontSize={14} color={colors.gray700} fontWeight="600">
              {mission.hourly_rate}€ / heure
            </Text>
          </XStack>
        )}
        {mission.is_urgent && (
          <XStack alignItems="center" gap="$2">
            <Text fontSize={18}>⭐</Text>
            <Text fontSize={14} color={colors.shiftlyGold} fontWeight="600">
              Visibilité Boostée
            </Text>
          </XStack>
        )}
      </XStack>
    </YStack>
  );
}

