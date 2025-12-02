"use client";

import { YStack, Text, ScrollView } from "tamagui";
import { colors } from "@shiftly/ui";
import type { ConversationWithDetails } from "@shiftly/data";
import { ConversationItem } from "./ConversationItem";
import { ConfirmDialog } from "@/components/ui";
import { useResponsive, useDeleteConversation } from "@/hooks";

interface ConversationsListProps {
  conversations: ConversationWithDetails[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string | null) => void;
  getOtherParticipantName: (conversation: ConversationWithDetails) => string;
  formatTime: (dateString?: string) => string;
  isLoading: boolean;
  onConversationDeleted?: () => void;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  getOtherParticipantName,
  formatTime,
  isLoading,
  onConversationDeleted,
}: ConversationsListProps) {
  const { isMobile, mounted } = useResponsive();
  const {
    deleteDialogOpen,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    getConversationToDeleteName,
    setDeleteDialogOpen,
  } = useDeleteConversation({
    selectedConversationId,
    onConversationDeleted,
    onDeselectConversation: () => onSelectConversation(null),
  });

  const conversationToDeleteName = getConversationToDeleteName(
    conversations,
    getOtherParticipantName
  );

  return (
    <>
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
                  onDelete={handleDeleteClick}
                  otherParticipantName={getOtherParticipantName(conversation)}
                  formatTime={formatTime}
                />
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>

      {/* Modal de confirmation de suppression */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) handleCancelDelete();
        }}
        title="Supprimer la conversation"
        message={`Êtes-vous sûr de vouloir supprimer la conversation avec ${conversationToDeleteName} ? Cette action supprimera également tous les messages et ne pourra pas être annulée.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
