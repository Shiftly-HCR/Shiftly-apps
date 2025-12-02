"use client";

import { useCallback } from "react";

interface UseConversationItemActionsProps {
  conversationId: string;
  onDelete?: (conversationId: string) => void;
}

/**
 * Hook pour gérer les actions d'un item de conversation
 * Gère notamment le clic de suppression avec stopPropagation
 */
export function useConversationItemActions({
  conversationId,
  onDelete,
}: UseConversationItemActionsProps) {
  const handleDelete = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(conversationId);
      }
    },
    [conversationId, onDelete]
  );

  return {
    handleDelete,
  };
}
