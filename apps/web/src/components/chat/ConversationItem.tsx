"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { ConversationWithDetails } from "@shiftly/data";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  otherParticipantName: string;
  formatTime: (dateString?: string) => string;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  otherParticipantName,
  formatTime,
}: ConversationItemProps) {
  const lastMessage = conversation.last_message;

  return (
    <XStack
      padding="$4"
      borderBottomWidth={1}
      borderBottomColor={colors.gray200}
      backgroundColor={isSelected ? colors.gray050 : "transparent"}
      cursor="pointer"
      hoverStyle={{
        backgroundColor: colors.gray050,
      }}
      onPress={onSelect}
    >
      <YStack flex={1} gap="$1">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} fontWeight="600" color={colors.gray900}>
            {otherParticipantName}
          </Text>
          {lastMessage && (
            <Text fontSize={11} color={colors.gray500}>
              {formatTime(lastMessage.created_at)}
            </Text>
          )}
        </XStack>
        {conversation.mission && (
          <Text fontSize={12} color={colors.gray700}>
            {conversation.mission.title}
          </Text>
        )}
        {lastMessage && (
          <Text fontSize={12} color={colors.gray700} numberOfLines={1}>
            {lastMessage.content}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
