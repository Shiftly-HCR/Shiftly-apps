"use client";

import { YStack, XStack, Text, ScrollView } from "tamagui";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, colors } from "@shiftly/ui";
import { AppLayout } from "../../components/AppLayout";
import { listUserConversations, useChat } from "@shiftly/data";
import type { ConversationWithDetails } from "@shiftly/data";
import { ChatThread, MessageInput } from "../../components/chat";
import { useCurrentProfile } from "../../hooks";
import { getProfileById } from "@shiftly/data";

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
          <YStack
            width={350}
            borderRightWidth={1}
            borderRightColor={colors.gray200}
            backgroundColor={colors.white}
            $sm={{ width: "100%", borderRightWidth: 0 }}
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
              {isLoadingConversations ? (
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
                  {conversations.map((conversation) => {
                    const isSelected =
                      conversation.id === selectedConversationId;
                    const otherName = getOtherParticipantName(conversation);
                    const lastMessage = conversation.last_message;

                    return (
                      <XStack
                        key={conversation.id}
                        padding="$4"
                        borderBottomWidth={1}
                        borderBottomColor={colors.gray200}
                        backgroundColor={
                          isSelected ? colors.gray050 : "transparent"
                        }
                        cursor="pointer"
                        hoverStyle={{
                          backgroundColor: colors.gray050,
                        }}
                        onPress={() =>
                          setSelectedConversationId(conversation.id)
                        }
                      >
                        <YStack flex={1} gap="$1">
                          <XStack
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text
                              fontSize={14}
                              fontWeight="600"
                              color={colors.gray900}
                            >
                              {otherName}
                            </Text>
                            {lastMessage && (
                              <Text fontSize={11} color={colors.gray500}>
                                {formatLastMessageTime(lastMessage.created_at)}
                              </Text>
                            )}
                          </XStack>
                          {conversation.mission && (
                            <Text fontSize={12} color={colors.gray700}>
                              {conversation.mission.title}
                            </Text>
                          )}
                          {lastMessage && (
                            <Text
                              fontSize={12}
                              color={colors.gray700}
                              numberOfLines={1}
                            >
                              {lastMessage.content}
                            </Text>
                          )}
                          {conversation.unread_count &&
                            conversation.unread_count > 0 && (
                              <XStack
                                alignSelf="flex-start"
                                backgroundColor={colors.shiftlyViolet}
                                borderRadius={10}
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                              >
                                <Text
                                  fontSize={10}
                                  fontWeight="600"
                                  color={colors.white}
                                >
                                  {conversation.unread_count}
                                </Text>
                              </XStack>
                            )}
                        </YStack>
                      </XStack>
                    );
                  })}
                </YStack>
              )}
            </ScrollView>
          </YStack>

          {/* Conversation sélectionnée */}
          {selectedConversationId && selectedConversation ? (
            <YStack flex={1} backgroundColor={colors.white}>
              {/* En-tête de la conversation */}
              <YStack
                padding="$4"
                borderBottomWidth={1}
                borderBottomColor={colors.gray200}
                backgroundColor={colors.white}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack>
                    <Text fontSize={16} fontWeight="600" color={colors.gray900}>
                      {getOtherParticipantName(selectedConversation)}
                    </Text>
                    {selectedConversation.mission && (
                      <Text fontSize={12} color={colors.gray700}>
                        {selectedConversation.mission.title}
                      </Text>
                    )}
                  </YStack>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setSelectedConversationId(null)}
                  >
                    Fermer
                  </Button>
                </XStack>
              </YStack>

              {/* Messages */}
              <ChatThread
                messages={chat.messages}
                currentUserId={profile?.id || ""}
                senderNames={senderNames}
                isLoading={chat.isLoading}
              />

              {/* Input */}
              <MessageInput
                onSend={async (content) => {
                  const success = await chat.sendMessage(content);
                  if (success) {
                    chat.markAsRead();
                  }
                }}
                isSending={chat.isSending}
              />
            </YStack>
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
