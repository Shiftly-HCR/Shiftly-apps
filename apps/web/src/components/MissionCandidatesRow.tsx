"use client";

import { XStack, YStack, Text, Image } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMessageCircle } from "react-icons/fi";
import { SimpleCheckbox } from "./SimpleCheckbox";
import { type MissionApplicationWithProfile, type ApplicationStatus } from "@shiftly/data";
import { openConversation } from "../utils/chatService";

interface MissionCandidatesRowProps {
  application: MissionApplicationWithProfile;
  isSelected: boolean;
  onToggleSelection: () => void;
  onStatusChange: (newStatus: ApplicationStatus) => void;
  isUpdating: boolean;
  getStatusLabel: (status: ApplicationStatus) => string;
  getStatusColor: (status: ApplicationStatus) => string;
  formatDate: (dateString?: string) => string;
  missionId?: string;
  recruiterId?: string;
}

export function MissionCandidatesRow({
  application,
  isSelected,
  onToggleSelection,
  onStatusChange,
  isUpdating,
  getStatusLabel,
  getStatusColor,
  formatDate,
  missionId,
  recruiterId,
}: MissionCandidatesRowProps) {
  const router = useRouter();
  
  const profileName = application.profile
    ? `${application.profile.first_name || ""} ${application.profile.last_name || ""}`.trim() ||
      "Nom non renseigné"
    : `Utilisateur ${application.user_id.substring(0, 8)}`;

  const handleNameClick = () => {
    router.push(`/profile/${application.user_id}`);
  };

  const availableStatuses: ApplicationStatus[] =
    application.status === "pending"
      ? ["shortlisted", "rejected", "accepted"]
      : application.status === "applied"
        ? ["shortlisted", "rejected"]
        : application.status === "shortlisted"
          ? ["accepted", "rejected"]
          : [];

  return (
    <XStack
      padding="$4"
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
      alignItems="center"
      hoverStyle={{
        backgroundColor: colors.gray050,
      }}
    >
      {/* Checkbox */}
      <XStack width="40px" alignItems="center" justifyContent="center">
        <SimpleCheckbox checked={isSelected} onPress={onToggleSelection} />
      </XStack>

      {/* Nom et photo */}
      <XStack flex={1} alignItems="center" gap="$3">
        {application.profile?.photo_url ? (
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            overflow="hidden"
            backgroundColor={colors.gray200}
          >
            <Image
              source={{
                uri: application.profile.photo_url,
              }}
              width="100%"
              height="100%"
              resizeMode="cover"
            />
          </YStack>
        ) : (
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor={colors.gray200}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={18} color={colors.gray500}>
              {profileName.charAt(0).toUpperCase()}
            </Text>
          </YStack>
        )}
        <YStack>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.shiftlyViolet}
            cursor="pointer"
            hoverStyle={{
              textDecorationLine: "underline",
            }}
            onPress={handleNameClick}
          >
            {profileName}
          </Text>
          <Text fontSize={12} color={colors.gray500}>
            {formatDate(application.created_at)}
          </Text>
        </YStack>
      </XStack>

      {/* Statut */}
      <XStack width={120} alignItems="center">
        <XStack
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius={12}
          backgroundColor={getStatusColor(application.status) + "20"}
        >
          <Text
            fontSize={12}
            fontWeight="600"
            color={getStatusColor(application.status)}
          >
            {getStatusLabel(application.status)}
          </Text>
        </XStack>
      </XStack>

      {/* Note (placeholder) */}
      <XStack width={80} alignItems="center" gap="$1">
        <Text fontSize={14}>⭐</Text>
        <Text fontSize={14} color={colors.gray700} fontWeight="600">
          4.8
        </Text>
      </XStack>

      {/* Actions */}
      <XStack width={120} alignItems="center" justifyContent="flex-end" gap="$2">
        {/* Bouton de messagerie */}
        {missionId && recruiterId && (
          <Button
            variant="ghost"
            size="sm"
            onPress={async () => {
              const result = await openConversation(
                {
                  missionId,
                  recruiterId,
                  freelanceId: application.user_id,
                },
                (conversationId) => {
                  router.push(`/messagerie?conversationId=${conversationId}`);
                }
              );

              if (!result.success) {
                alert(result.error || "Erreur lors de l'ouverture de la conversation");
              }
            }}
            disabled={isUpdating}
          >
            <FiMessageCircle size={18} color={colors.shiftlyViolet} />
          </Button>
        )}
        
        {/* Menu d'actions */}
        {availableStatuses.length > 0 ? (
          <YStack position="relative">
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                // Menu déroulant simplifié - on peut améliorer avec un dropdown
                const firstAction = availableStatuses[0];
                onStatusChange(firstAction);
              }}
              disabled={isUpdating}
            >
              ⋯
            </Button>
          </YStack>
        ) : (
          <Text fontSize={14} color={colors.gray500}>
            -
          </Text>
        )}
      </XStack>
    </XStack>
  );
}

