"use client";

import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { AppLayout } from "@/components/AppLayout";
import { useChat } from "@shiftly/data";
import { ConversationsList, ConversationView } from "@/components/chat";
import { useConversations } from "@/hooks/useConversations";
import { formatLastMessageTime } from "@/utils/messagingHelpers";
import { useCurrentProfile } from "@/hooks";

export default function MessageriePage() {
  const { profile } = useCurrentProfile();
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversation,
    isLoadingConversations,
    senderNames,
    getOtherParticipantName,
  } = useConversations();

  // Hook pour le chat
  const chat = useChat(selectedConversationId);

  return (
    <AppLayout>
      <YStack flex={1} backgroundColor={colors.backgroundLight}>
        <XStack flex={1} height="100%">
          {/* Liste des conversations */}
          <ConversationsList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            getOtherParticipantName={getOtherParticipantName}
            formatTime={formatLastMessageTime}
            isLoading={isLoadingConversations}
          />

          {/* Conversation sélectionnée */}
          {selectedConversationId && selectedConversation ? (
            <ConversationView
              conversation={selectedConversation}
              messages={chat.messages}
              currentUserId={profile?.id || ""}
              senderNames={senderNames}
              isLoading={chat.isLoading}
              isSending={chat.isSending}
              onSendMessage={chat.sendMessage}
              onMarkAsRead={chat.markAsRead}
              onClose={() => setSelectedConversationId(null)}
              getOtherParticipantName={getOtherParticipantName}
            />
          ) : (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$4"
              padding="$6"
              backgroundColor={colors.white}
            >
              <Text fontSize={18} fontWeight="600" color={colors.gray700}>
                Sélectionnez une conversation
              </Text>
              <Text fontSize={14} color={colors.gray500} textAlign="center">
                Choisissez une conversation dans la liste pour commencer à
                échanger
              </Text>
            </YStack>
          )}
        </XStack>
      </YStack>
    </AppLayout>
  );
}
