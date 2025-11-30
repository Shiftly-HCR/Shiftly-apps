"use client";

import { YStack, XStack, Text } from "tamagui";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { colors } from "@shiftly/ui";
import { AppLayout } from "../../components/AppLayout";
import { listUserConversations, useChat } from "@shiftly/data";
import type { ConversationWithDetails } from "@shiftly/data";
import { ConversationsList, ConversationView } from "../../components/chat";
import { useCurrentProfile } from "../../hooks";

export default function MessageriePage() {
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

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Hook pour le chat
  const chat = useChat(selectedConversationId);

  // Mettre à jour les noms des expéditeurs avec ceux du chat
  useEffect(() => {
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
  }, [selectedConversation]);

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} min`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours}h`;
    }
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getOtherParticipantName = (conversation: ConversationWithDetails) => {
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
