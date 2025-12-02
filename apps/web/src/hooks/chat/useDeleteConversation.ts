"use client";

import { useState } from "react";
import { deleteConversation } from "@shiftly/data";
import { useShiftlyToast } from "@shiftly/ui";
import type { ConversationWithDetails } from "@shiftly/data";

interface UseDeleteConversationProps {
  selectedConversationId: string | null;
  onConversationDeleted?: () => void;
  onDeselectConversation?: () => void;
}

export function useDeleteConversation({
  selectedConversationId,
  onConversationDeleted,
  onDeselectConversation,
}: UseDeleteConversationProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useShiftlyToast();

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteConversation(conversationToDelete);

      if (result.success) {
        toast.success("Conversation supprimée", {
          description: "La conversation et tous ses messages ont été supprimés",
        });

        // Si la conversation supprimée était sélectionnée, désélectionner
        if (selectedConversationId === conversationToDelete) {
          onDeselectConversation?.();
        }

        // Rafraîchir la liste des conversations
        onConversationDeleted?.();
      } else {
        toast.error("Erreur", {
          description:
            result.error || "Impossible de supprimer la conversation",
        });
      }
    } catch (error: any) {
      toast.error("Erreur", {
        description: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const getConversationToDeleteName = (
    conversations: ConversationWithDetails[],
    getOtherParticipantName: (conversation: ConversationWithDetails) => string
  ): string => {
    if (!conversationToDelete) return "";
    const conversation = conversations.find(
      (c) => c.id === conversationToDelete
    );
    if (!conversation) return "";
    return getOtherParticipantName(conversation);
  };

  return {
    deleteDialogOpen,
    conversationToDelete,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    getConversationToDeleteName,
    setDeleteDialogOpen,
  };
}
