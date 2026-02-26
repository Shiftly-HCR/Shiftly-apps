"use client";

import { XStack, YStack, Text, Image, Popover } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import { useRouter } from "next/navigation";
import { FiMessageCircle } from "react-icons/fi";
import { useState } from "react";
import { SimpleCheckbox } from "@/components/ui/SimpleCheckbox";
import {
  type MissionApplicationWithProfile,
  type ApplicationStatus,
} from "@shiftly/data";
import { openConversation } from "@/utils/chatService";
import { useMissionCandidatesRow } from "@/hooks";

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
  isMobile?: boolean;
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
  isMobile = false,
}: MissionCandidatesRowProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profileName, handleNameClick, availableStatuses } =
    useMissionCandidatesRow({
      application,
    });

  // Mobile: card layout (stacked)
  if (isMobile) {
    return (
      <YStack
        padding="$4"
        borderRadius={12}
        borderWidth={1}
        borderColor={colors.gray200}
        backgroundColor={colors.white}
        gap="$3"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$3" flex={1} minWidth={0}>
            <SimpleCheckbox checked={isSelected} onPress={onToggleSelection} />
            {application.profile?.photo_url ? (
              <YStack
                width={44}
                height={44}
                borderRadius={22}
                overflow="hidden"
                backgroundColor={colors.gray200}
              >
                <Image
                  source={{ uri: application.profile.photo_url }}
                  width="100%"
                  height="100%"
                  resizeMode="cover"
                />
              </YStack>
            ) : (
              <YStack
                width={44}
                height={44}
                borderRadius={22}
                backgroundColor={colors.gray200}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={16} color={colors.gray500}>
                  {profileName.charAt(0).toUpperCase()}
                </Text>
              </YStack>
            )}
            <YStack flex={1} minWidth={0}>
              <Text
                fontSize={14}
                fontWeight="600"
                color={colors.shiftlyViolet}
                cursor="pointer"
                numberOfLines={1}
                onPress={handleNameClick}
              >
                {profileName}
              </Text>
              <Text fontSize={12} color={colors.gray500}>
                {formatDate(application.created_at)}
              </Text>
            </YStack>
          </XStack>
        </XStack>
        <XStack flexWrap="wrap" gap="$2" alignItems="center">
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
          <XStack alignItems="center" gap="$1">
            <Text fontSize={14}>⭐</Text>
            <Text fontSize={14} color={colors.gray700} fontWeight="600">
              4.8
            </Text>
          </XStack>
          {application.profile?.daily_rate && (
            <Text fontSize={14} color={colors.gray700} fontWeight="600">
              {application.profile.daily_rate.toFixed(2)} € / jour
            </Text>
          )}
        </XStack>
        <XStack gap="$2" justifyContent="flex-end" flexWrap="wrap">
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
                  alert(
                    result.error ||
                      "Erreur lors de l'ouverture de la conversation"
                  );
                }
              }}
              disabled={isUpdating}
            >
              <XStack alignItems="center" gap="$2">
                <FiMessageCircle size={18} color={colors.shiftlyViolet} />
                <Text fontSize={12}>Message</Text>
              </XStack>
            </Button>
          )}
          {availableStatuses.length > 0 && (
            <Popover
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
              placement="bottom-end"
              size="$5"
              allowFlip
            >
              <Popover.Trigger asChild>
                <Button variant="outline" size="sm" disabled={isUpdating}>
                  Changer le statut
                </Button>
              </Popover.Trigger>
              <Popover.Content
                padding={0}
                borderWidth={1}
                borderColor={colors.gray200}
                backgroundColor={colors.white}
                borderRadius={8}
                shadowColor={colors.gray900}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
                zIndex={1000}
                enterStyle={{ opacity: 0, scale: 0.95 }}
                exitStyle={{ opacity: 0, scale: 0.95 }}
              >
                <YStack minWidth={180}>
                  {availableStatuses.map((status, index) => (
                    <XStack
                      key={status}
                      paddingHorizontal="$3"
                      paddingVertical="$2.5"
                      cursor="pointer"
                      hoverStyle={{ backgroundColor: colors.gray050 }}
                      onPress={() => {
                        onStatusChange(status);
                        setIsMenuOpen(false);
                      }}
                      borderBottomWidth={
                        index < availableStatuses.length - 1 ? 1 : 0
                      }
                      borderBottomColor={colors.gray100}
                      borderStyle="solid"
                    >
                      <Text
                        fontSize={14}
                        color={colors.gray700}
                        fontWeight="500"
                      >
                        {getStatusLabel(status)}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </Popover.Content>
            </Popover>
          )}
        </XStack>
      </YStack>
    );
  }

  // Desktop: table row
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

      {/* TJM */}
      <XStack width={100} alignItems="center">
        {application.profile?.daily_rate ? (
          <Text fontSize={14} color={colors.gray700} fontWeight="600">
            {application.profile.daily_rate.toFixed(2)} €
          </Text>
        ) : (
          <Text fontSize={14} color={colors.gray500}>
            -
          </Text>
        )}
      </XStack>

      {/* Actions */}
      <XStack
        width={120}
        alignItems="center"
        justifyContent="flex-end"
        gap="$2"
      >
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
                alert(
                  result.error ||
                    "Erreur lors de l'ouverture de la conversation"
                );
              }
            }}
            disabled={isUpdating}
          >
            <FiMessageCircle size={18} color={colors.shiftlyViolet} />
          </Button>
        )}

        {/* Menu d'actions */}
        {availableStatuses.length > 0 ? (
          <Popover
            open={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            placement="bottom-end"
            size="$5"
            allowFlip
          >
            <Popover.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
              >
                ⋯
              </Button>
            </Popover.Trigger>

            <Popover.Content
              padding={0}
              borderWidth={1}
              borderColor={colors.gray200}
              backgroundColor={colors.white}
              borderRadius={8}
              shadowColor={colors.gray900}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
              zIndex={1000}
              enterStyle={{ opacity: 0, scale: 0.95 }}
              exitStyle={{ opacity: 0, scale: 0.95 }}
            >
              <YStack minWidth={180}>
                {availableStatuses.map((status, index) => (
                  <XStack
                    key={status}
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
                    cursor="pointer"
                    hoverStyle={{
                      backgroundColor: colors.gray050,
                    }}
                    onPress={() => {
                      onStatusChange(status);
                      setIsMenuOpen(false);
                    }}
                    borderBottomWidth={
                      index < availableStatuses.length - 1 ? 1 : 0
                    }
                    borderBottomColor={colors.gray100}
                    borderStyle="solid"
                  >
                    <Text
                      fontSize={14}
                      color={colors.gray700}
                      fontWeight="500"
                    >
                      {getStatusLabel(status)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </Popover.Content>
          </Popover>
        ) : (
          <Text fontSize={14} color={colors.gray500}>
            -
          </Text>
        )}
      </XStack>
    </XStack>
  );
}
