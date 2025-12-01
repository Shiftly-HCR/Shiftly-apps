"use client";

import { useState, useEffect, useMemo } from "react";
import { useChat, getOrCreateConversation } from "@shiftly/data";
import type { Conversation } from "@shiftly/data";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { getProfileById } from "@shiftly/data";
import { supabase } from "@shiftly/data";

/**
 * Hook pour gérer le chat d'une mission entre recruteur et freelance
 */
export function useMissionChat(
  missionId: string | null,
  recruiterId: string | null,
  freelanceId: string | null
) {
  const { profile: currentProfile } = useCurrentProfile();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [senderNames, setSenderNames] = useState<Map<string, string>>(new Map());

  const chat = useChat(conversation?.id || null);

  // Initialiser la conversation
  useEffect(() => {
    if (!missionId || !recruiterId || !freelanceId || !currentProfile) {
      setIsInitializing(false);
      return;
    }

    const initConversation = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        const result = await getOrCreateConversation({
          missionId,
          recruiterId,
          freelanceId,
        });

        if (!result.success || !result.conversation) {
          setError(result.error || "Erreur lors de l'initialisation de la conversation");
          setIsInitializing(false);
          return;
        }

        setConversation(result.conversation);

        // Charger les noms des expéditeurs
        const names = new Map<string, string>();
        const recruiterProfile = await getProfileById(recruiterId);
        const freelanceProfile = await getProfileById(freelanceId);

        if (recruiterProfile) {
          const recruiterName = `${recruiterProfile.first_name || ""} ${recruiterProfile.last_name || ""}`.trim() || "Recruteur";
          names.set(recruiterId, recruiterName);
        }

        if (freelanceProfile) {
          const freelanceName = `${freelanceProfile.first_name || ""} ${freelanceProfile.last_name || ""}`.trim() || "Freelance";
          names.set(freelanceId, freelanceName);
        }

        setSenderNames(names);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setIsInitializing(false);
      }
    };

    initConversation();
  }, [missionId, recruiterId, freelanceId, currentProfile]);

  // Vérifier si l'utilisateur peut accéder à cette conversation
  const canAccess = useMemo(() => {
    if (!conversation || !currentProfile) return false;
    return (
      conversation.recruiter_id === currentProfile.id ||
      conversation.freelance_id === currentProfile.id
    );
  }, [conversation, currentProfile]);

  return {
    conversation,
    messages: chat.messages,
    isLoading: isInitializing || chat.isLoading,
    isSending: chat.isSending,
    error: error || chat.error,
    sendMessage: chat.sendMessage,
    markAsRead: chat.markAsRead,
    canAccess,
    senderNames,
    currentUserId: currentProfile?.id || null,
  };
}

