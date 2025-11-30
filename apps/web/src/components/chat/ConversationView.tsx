"use client";

import { YStack, XStack, Text } from "tamagui";
import { Button, colors } from "@shiftly/ui";
import type { ConversationWithDetails } from "@shiftly/data";
import { ChatThread } from "./ChatThread";
import { MessageInput } from "./MessageInput";
import type { Message } from "@shiftly/data";

interface ConversationViewProps {
  conversation: ConversationWithDetails;
  messages: Message[];
  currentUserId: string;
  senderNames: Map<string, string>;
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (content: string) => Promise<boolean>;
  onMarkAsRead: () => void;
  onClose: () => void;
  getOtherParticipantName: (conversation: ConversationWithDetails) => string;
}

export function ConversationView({
  conversation,
  messages,
  currentUserId,
  senderNames,
  isLoading,
  isSending,
  onSendMessage,
  onMarkAsRead,
  onClose,
  getOtherParticipantName,
}: ConversationViewProps) {
  const handleSend = async (content: string) => {
    await onSendMessage(content);
    onMarkAsRead();
  };

  return (
    <YStack flex={1} backgroundColor={colors.white}>
      {/* En-tête de la conversation */}
      <YStack
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor={colors.gray200}
        backgroundColor={colors.white}
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack>
            <Text fontSize={16} fontWeight="600" color={colors.gray900}>
              {getOtherParticipantName(conversation)}
            </Text>
            {conversation.mission && (
              <Text fontSize={12} color={colors.gray700}>
                {conversation.mission.title}
              </Text>
            )}
          </YStack>
          <Button variant="ghost" size="sm" onPress={onClose}>
            Fermer
          </Button>
        </XStack>
      </YStack>

      {/* Messages */}
      <ChatThread
        messages={messages}
        currentUserId={currentUserId}
        senderNames={senderNames}
        isLoading={isLoading}
      />

      {/* Input */}
      <MessageInput onSend={handleSend} isSending={isSending} />
    </YStack>
  );
}

