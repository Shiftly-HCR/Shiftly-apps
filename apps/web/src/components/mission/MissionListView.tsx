"use client";

import { YStack, XStack } from "tamagui";
import { Badge, MissionCard } from "@shiftly/ui";
import type { Mission } from "@shiftly/data";
import { useResponsive } from "@/hooks";

interface MissionListViewProps {
  missions: Mission[];
  onMissionClick: (missionId: string) => void;
  formatDate: (startDate?: string, endDate?: string) => string;
  isNewMission: (createdAt?: string) => boolean;
}

export function MissionListView({
  missions,
  onMissionClick,
  formatDate,
  isNewMission,
}: MissionListViewProps) {
  const { isMobile } = useResponsive();

  return (
    <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
      {missions.map((mission) => (
        <YStack
          key={mission.id}
          width={isMobile ? "100%" : "calc(33.333% - 12px)"}
          minWidth={isMobile ? undefined : 300}
          position="relative"
          cursor="pointer"
          onPress={() => onMissionClick(mission.id)}
        >
          {isNewMission(mission.created_at) && (
            <YStack position="absolute" top={12} left={12} zIndex={10}>
              <Badge variant="new" size="sm">
                Nouveau
              </Badge>
            </YStack>
          )}
          <MissionCard
            title={mission.title}
            date={formatDate(mission.start_date, mission.end_date)}
            price={
              mission.daily_rate
                ? `${mission.daily_rate}€`
                : mission.hourly_rate
                  ? `${mission.hourly_rate}€`
                  : "À négocier"
            }
            priceUnit={mission.daily_rate ? "/ jour" : "/ heure"}
            image={mission.image_url}
          />
        </YStack>
      ))}
    </XStack>
  );
}
