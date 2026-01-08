"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { MissionCandidatesRow } from "./MissionCandidatesRow";
import { type MissionApplicationWithProfile, type ApplicationStatus } from "@shiftly/data";

interface MissionCandidatesListProps {
  applications: MissionApplicationWithProfile[];
  selectedApplications: string[];
  onToggleSelection: (applicationId: string) => void;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  isUpdating: boolean;
  getStatusLabel: (status: ApplicationStatus) => string;
  getStatusColor: (status: ApplicationStatus) => string;
  formatDate: (dateString?: string) => string;
  missionId?: string;
  recruiterId?: string;
}

export function MissionCandidatesList({
  applications,
  selectedApplications,
  onToggleSelection,
  onStatusChange,
  isUpdating,
  getStatusLabel,
  getStatusColor,
  formatDate,
  missionId,
  recruiterId,
}: MissionCandidatesListProps) {
  if (applications.length === 0) {
    return (
      <YStack
        padding="$8"
        backgroundColor={colors.white}
        borderRadius={12}
        borderWidth={1}
        borderColor={colors.gray200}
        alignItems="center"
        gap="$2"
      >
        <Text fontSize={16} color={colors.gray700} fontWeight="600">
          Aucune candidature pour le moment
        </Text>
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor={colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={colors.gray200}
      overflow="hidden"
    >
      {/* En-tête du tableau */}
      <XStack
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
        backgroundColor={colors.gray050}
      >
        <XStack width="40px" alignItems="center" justifyContent="center">
          {/* Checkbox pour sélection */}
        </XStack>
        <XStack flex={1}>
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            NOM
          </Text>
        </XStack>
        <XStack width={120} alignItems="center">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            STATUT
          </Text>
        </XStack>
        <XStack width={80} alignItems="center">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            NOTE
          </Text>
        </XStack>
        <XStack width={100} alignItems="center">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            TJM
          </Text>
        </XStack>
        <XStack width={120} alignItems="center">
          <Text fontSize={14} fontWeight="600" color={colors.gray700}>
            ACTIONS
          </Text>
        </XStack>
      </XStack>

      {/* Liste des candidats */}
      <YStack>
        {applications.map((application) => (
          <MissionCandidatesRow
            key={application.id}
            application={application}
            isSelected={selectedApplications.includes(application.id)}
            onToggleSelection={() => onToggleSelection(application.id)}
            onStatusChange={(newStatus) =>
              onStatusChange(application.id, newStatus)
            }
            isUpdating={isUpdating}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            missionId={missionId}
            recruiterId={recruiterId}
          />
        ))}
      </YStack>
    </YStack>
  );
}

