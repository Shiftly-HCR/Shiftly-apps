"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { colors } from "@shiftly/ui";
import type { ConversationWithDetails } from "@shiftly/data";
import { ConversationItem } from "./ConversationItem";
import { useResponsive } from "@/hooks";

interface ConversationsListProps {
  conversations: ConversationWithDetails[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  getOtherParticipantName: (conversation: ConversationWithDetails) => string;
  formatTime: (dateString?: string) => string;
  isLoading: boolean;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  getOtherParticipantName,
  formatTime,
  isLoading,
}: ConversationsListProps) {
  const { isMobile, mounted } = useResponsive();

  return (
    <YStack
      width={mounted && isMobile ? "100%" : 350}
      borderRightWidth={mounted && isMobile ? 0 : 1}
      borderRightColor={colors.gray200}
      backgroundColor={colors.white}
    >
      {/* En-tête */}
      <YStack
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
      >
        <Text fontSize={20} fontWeight="700" color={colors.gray900}>
          Messagerie
        </Text>
      </YStack>

      {/* Liste */}
      <ScrollView flex={1}>
        {isLoading ? (
          <YStack padding="$4" alignItems="center">
            <Text fontSize={14} color={colors.gray700}>
              Chargement...
            </Text>
          </YStack>
        ) : conversations.length === 0 ? (
          <YStack padding="$4" alignItems="center" gap="$2">
            <Text fontSize={14} color={colors.gray700} textAlign="center">
              Aucune conversation pour le moment
            </Text>
            <Text fontSize={12} color={colors.gray500} textAlign="center">
              Les conversations apparaîtront ici une fois que vous aurez
              commencé à échanger avec quelqu'un
            </Text>
          </YStack>
        ) : (
          <YStack>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onSelect={() => onSelectConversation(conversation.id)}
                otherParticipantName={getOtherParticipantName(conversation)}
                formatTime={formatTime}
              />
            ))}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
