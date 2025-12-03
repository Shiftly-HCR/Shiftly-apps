"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { MissionCard, Badge } from "@shiftly/ui";
import type { Mission } from "@shiftly/data";

interface MissionVisibleListProps {
  missions: Mission[];
  onMissionClick: (missionId: string) => void;
  formatDate: (startDate?: string, endDate?: string) => string;
  isNewMission: (createdAt?: string) => boolean;
}

/**
 * Composant pour afficher la liste des missions visibles dans la vue actuelle de la carte
 * S'affiche sous la carte et se met à jour en temps réel
 */
export function MissionVisibleList({
  missions,
  onMissionClick,
  formatDate,
  isNewMission,
}: MissionVisibleListProps) {
  if (missions.length === 0) {
    return (
      <YStack
        padding="$4"
        backgroundColor="white"
        borderRadius={12}
        borderWidth={1}
        borderColor="#E0E0E0"
        alignItems="center"
        justifyContent="center"
        minHeight={100}
      >
        <Text fontSize={14} color="#999">
          Aucune mission visible dans cette zone
        </Text>
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      borderWidth={1}
      borderColor="#E0E0E0"
      padding="$4"
      gap="$3"
    >
      <XStack
        alignItems="center"
        justifyContent="space-between"
        marginBottom="$2"
      >
        <Text fontSize={16} fontWeight="600" color="#000">
          Missions visibles ({missions.length})
        </Text>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$3" paddingVertical="$2">
          {missions.map((mission) => (
            <YStack
              key={mission.id}
              width={300}
              minWidth={300}
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
                  mission.hourly_rate ? `${mission.hourly_rate}€` : "À négocier"
                }
                priceUnit="/ heure"
                image={mission.image_url}
                showButton={false}
              />
            </YStack>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
