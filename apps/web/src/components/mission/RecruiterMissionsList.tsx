"use client";

import { XStack, YStack } from "tamagui";
import { MissionCard, CreateMissionCard } from "@shiftly/ui";
import { PageSection, EmptyState } from "@/components";
import { RecruiterMissionCard } from "./RecruiterMissionCard";
import type { Mission } from "@shiftly/data";

interface RecruiterMissionsListProps {
  missions: Mission[];
  onCreateMission: () => void;
  onMissionClick: (missionId: string) => void;
  onEditMission: (missionId: string) => void;
  onManageCandidates: (missionId: string) => void;
  onDeleteMission: (missionId: string, missionTitle: string) => void;
}

export function RecruiterMissionsList({
  missions,
  onCreateMission,
  onMissionClick,
  onEditMission,
  onManageCandidates,
  onDeleteMission,
}: RecruiterMissionsListProps) {
  return (
    <PageSection title="Toutes les missions">
      <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
        {/* Carte de création */}
        <YStack width="calc(33.333% - 12px)" minWidth={300}>
          <CreateMissionCard onPress={onCreateMission} />
        </YStack>

        {/* Missions existantes */}
        {missions.map((mission) => (
          <RecruiterMissionCard
            key={mission.id}
            mission={mission}
            onPress={() => onMissionClick(mission.id)}
            onEdit={() => onEditMission(mission.id)}
            onManageCandidates={() => onManageCandidates(mission.id)}
            onDelete={() => onDeleteMission(mission.id, mission.title)}
          />
        ))}
      </XStack>

      {/* Message si aucune mission */}
      {missions.length === 0 && (
        <EmptyState
          title="Vous n'avez pas encore créé de mission"
          description="Commencez par créer votre première mission en cliquant sur la carte ci-dessus"
        />
      )}
    </PageSection>
  );
}

