"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUserConversations,
  deleteConversation,
  getUnreadMessagesCount,
  supabase,
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
 * Hook pour récupérer le nombre total de messages non lus.
 */
export function useUnreadMessagesCount() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();

  const query = useQuery({
    queryKey: ["messages", "unread", "count", user?.id],
    queryFn: getUnreadMessagesCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
    enabled: !isLoadingUser && !!user,
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`unread:messages:${user.id}:${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["messages", "unread", "count", user.id],
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["messages", "unread", "count", user.id],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, user?.id]);

  return {
    ...query,
    unreadCount: query.data ?? 0,
  };
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
