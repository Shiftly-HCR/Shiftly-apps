"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { Trash2 } from "lucide-react";
import type { ConversationWithDetails } from "@shiftly/data";
import { useConversationItemActions } from "@/hooks";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (conversationId: string) => void;
  otherParticipantName: string;
  formatTime: (dateString?: string) => string;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  otherParticipantName,
  formatTime,
}: ConversationItemProps) {
  const lastMessage = conversation.last_message;
  const { handleDelete } = useConversationItemActions({
    conversationId: conversation.id,
    onDelete,
  });

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
      alignItems="center"
      gap="$3"
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
      {onDelete && (
        <XStack
          padding="$2"
          borderRadius="$2"
          cursor="pointer"
          hoverStyle={{
            backgroundColor: colors.gray100,
          }}
          onPress={handleDelete}
        >
          <Trash2 size={16} color="#EF4444" />
        </XStack>
      )}
    </XStack>
  );
}
