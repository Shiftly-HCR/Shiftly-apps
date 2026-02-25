"use client";

import { XStack, YStack, Text } from "tamagui";
import { CreateMissionCard } from "@shiftly/ui";
import { PageSection, EmptyState } from "@/components";
import { RecruiterMissionCard } from "./RecruiterMissionCard";
import type { Mission } from "@shiftly/data";
import { useResponsive } from "@/hooks";

interface RecruiterMissionsListProps {
  missions: Mission[];
  onCreateMission: () => void;
  onMissionClick: (missionId: string) => void;
  onEditMission: (missionId: string) => void;
  onManageCandidates: (missionId: string) => void;
  onDeleteMission: (missionId: string, missionTitle: string) => void;
  /** Whether the recruiter can create a new mission (quota not reached) */
  canCreateMissionByQuota?: boolean;
  /** Active missions count (draft + published) for non-premium */
  activeMissionsCount?: number;
  /** Active missions limit (null = unlimited for premium) */
  activeMissionsLimit?: number | null;
}

export function RecruiterMissionsList({
  missions,
  onCreateMission,
  onMissionClick,
  onEditMission,
  onManageCandidates,
  onDeleteMission,
  canCreateMissionByQuota = true,
  activeMissionsCount = 0,
  activeMissionsLimit = null,
}: RecruiterMissionsListProps) {
  const { isMobile } = useResponsive();

  return (
    <PageSection title="Toutes les missions">
      <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
        {/* Carte de création ou message limite atteinte */}
        <YStack
          width={isMobile ? "100%" : "calc(33.333% - 12px)"}
          minWidth={isMobile ? undefined : 300}
          gap="$2"
        >
          {!canCreateMissionByQuota && activeMissionsLimit != null ? (
            <>
              <YStack
                padding="$4"
                backgroundColor="#FFF3CD"
                borderRadius={12}
                borderWidth={1}
                borderColor="#856404"
              >
                <Text fontSize={14} color="#856404" fontWeight="600">
                  Vous avez atteint la limite de {activeMissionsLimit} annonces (compte gratuit). Passez Premium pour en publier plus.
                </Text>
              </YStack>
              <Text fontSize={13} color="#666">
                {activeMissionsCount} / {activeMissionsLimit} annonces
              </Text>
            </>
          ) : (
            <>
              <CreateMissionCard onPress={onCreateMission} />
              {activeMissionsLimit != null && (
                <Text fontSize={13} color="#666">
                  {activeMissionsCount} / {activeMissionsLimit} annonces
                </Text>
              )}
            </>
          )}
        </YStack>

        {/* Missions existantes */}
        {missions.map((mission) => (
          <RecruiterMissionCard
            key={mission.id}
            isMobile={isMobile}
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

