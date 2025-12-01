"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listUserConversations } from "@shiftly/data";
import type { ConversationWithDetails } from "@shiftly/data";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

/**
 * Hook pour gérer les conversations et la sélection
 */
export function useConversations() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("conversationId");
  const { profile } = useCurrentProfile();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationIdParam);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [senderNames, setSenderNames] = useState<Map<string, string>>(
    new Map()
  );

  // Charger les conversations
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const loadedConversations = await listUserConversations();
        setConversations(loadedConversations);

        // Charger les noms de tous les participants
        const names = new Map<string, string>();
        for (const conv of loadedConversations) {
          if (conv.recruiter) {
            const recruiterName =
              `${conv.recruiter.first_name || ""} ${conv.recruiter.last_name || ""}`.trim() ||
              "Recruteur";
            names.set(conv.recruiter_id, recruiterName);
          }
          if (conv.freelance) {
            const freelanceName =
              `${conv.freelance.first_name || ""} ${conv.freelance.last_name || ""}`.trim() ||
              "Freelance";
            names.set(conv.freelance_id, freelanceName);
          }
        }
        setSenderNames(names);
      } catch (err) {
        console.error("Erreur lors du chargement des conversations:", err);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, []);

  // Mettre à jour l'URL quand la conversation sélectionnée change
  useEffect(() => {
    if (selectedConversationId) {
      const url = new URL(window.location.href);
      url.searchParams.set("conversationId", selectedConversationId);
      router.replace(url.pathname + url.search, { scroll: false });
    } else {
      router.replace("/messagerie", { scroll: false });
    }
  }, [selectedConversationId, router]);

  // Utiliser le paramètre URL pour sélectionner la conversation au chargement
  useEffect(() => {
    if (conversationIdParam && !selectedConversationId) {
      setSelectedConversationId(conversationIdParam);
    }
  }, [conversationIdParam]);

  // Mettre à jour les noms des expéditeurs avec ceux de la conversation sélectionnée
  useEffect(() => {
    const selectedConversation = conversations.find(
      (c) => c.id === selectedConversationId
    );

    if (selectedConversation) {
      const names = new Map(senderNames);
      if (selectedConversation.recruiter) {
        const recruiterName =
          `${selectedConversation.recruiter.first_name || ""} ${selectedConversation.recruiter.last_name || ""}`.trim() ||
          "Recruteur";
        names.set(selectedConversation.recruiter_id, recruiterName);
      }
      if (selectedConversation.freelance) {
        const freelanceName =
          `${selectedConversation.freelance.first_name || ""} ${selectedConversation.freelance.last_name || ""}`.trim() ||
          "Freelance";
        names.set(selectedConversation.freelance_id, freelanceName);
      }
      setSenderNames(names);
    }
  }, [selectedConversationId, conversations]);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const getOtherParticipantName = (
    conversation: ConversationWithDetails
  ): string => {
    if (!profile) return "Utilisateur";
    if (conversation.recruiter_id === profile.id) {
      return (
        senderNames.get(conversation.freelance_id) ||
        conversation.freelance?.first_name ||
        "Freelance"
      );
    }
    return (
      senderNames.get(conversation.recruiter_id) ||
      conversation.recruiter?.first_name ||
      "Recruteur"
    );
  };

  return {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversation,
    isLoadingConversations,
    senderNames,
    getOtherParticipantName,
  };
}
