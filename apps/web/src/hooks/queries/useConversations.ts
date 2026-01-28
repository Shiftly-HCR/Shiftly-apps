"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUserConversations,
  deleteConversation,
  type ConversationWithDetails,
} from "@shiftly/data";
import { useCurrentUser } from "./useAuth";

/**
 * Hook pour récupérer les conversations de l'utilisateur
 * Attend que l'utilisateur soit chargé avant de charger les conversations
 */
export function useUserConversations() {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();


  return useQuery({
    queryKey: ["conversations", "user", user?.id],
    queryFn: async () => {
      const result = await listUserConversations();
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
    enabled: !isLoadingUser && !!user, // Attendre que l'utilisateur soit chargé
  });
}

/**
 * Hook pour supprimer une conversation
 */
export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      // Invalider les conversations
      queryClient.invalidateQueries({ queryKey: ["conversations", "user"] });
    },
  });
}
