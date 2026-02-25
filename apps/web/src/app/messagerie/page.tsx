"use client";

import { Suspense } from "react";
import { YStack, XStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import { AppLayout, ConversationsList, ConversationView } from "@/components";
import { useChat } from "@shiftly/data";
import { useConversations, useResponsive } from "@/hooks";
import { formatLastMessageTime } from "@/utils/messagingHelpers";
import { useCurrentProfile } from "@/hooks";

function MessagerieContent() {
  const { profile } = useCurrentProfile();
  const { isMobile } = useResponsive();
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversation,
    isLoadingConversations,
    senderNames,
    getOtherParticipantName,
    refreshConversations,
  } = useConversations();

  // Hook pour le chat
  const chat = useChat(selectedConversationId);

  // Mobile: show either list or conversation (list/detail pattern)
  // Desktop: show both side by side
  const showList = !isMobile || !selectedConversationId;
  const showConversation = selectedConversationId && selectedConversation;

  return (
    <YStack flex={1} backgroundColor={colors.backgroundLight}>
      <XStack flex={1} height="100%">
        {/* Liste des conversations - hidden on mobile when conversation is selected */}
        {showList && (
          <ConversationsList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            getOtherParticipantName={getOtherParticipantName}
            formatTime={formatLastMessageTime}
            isLoading={isLoadingConversations}
            onConversationDeleted={refreshConversations}
          />
        )}

        {/* Conversation sélectionnée */}
        {showConversation ? (
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
            showBackButton={isMobile}
          />
        ) : !isMobile ? (
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
        ) : null}
      </XStack>
    </YStack>
  );
}

export default function MessageriePage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            backgroundColor={colors.backgroundLight}
          >
            <Text fontSize={16} color={colors.gray500}>
              Chargement...
            </Text>
          </YStack>
        }
      >
        <MessagerieContent />
      </Suspense>
    </AppLayout>
  );
}
