"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserConversations } from "@/hooks/queries";
import { supabase } from "@shiftly/data";
import type { ConversationWithDetails, Conversation } from "@shiftly/data";
import { useCurrentProfile } from "@/hooks/profile/useCurrentProfile";

/**
 * Hook pour gérer les conversations et la sélection
 */
export function useConversations() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("conversationId");
  const { profile } = useCurrentProfile();
  
  // Utiliser React Query pour charger les conversations
  const { data: conversationsData = [], isLoading: isLoadingConversations, refetch: refreshConversations } = useUserConversations();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationIdParam);
  const [senderNames, setSenderNames] = useState<Map<string, string>>(
    new Map()
  );
  const subscriptionRef = useRef<any>(null);
  
  // Mettre à jour les conversations locales quand les données React Query changent
  useEffect(() => {
    console.log(`📥 Conversations data changed:`, conversationsData.length);
    
    // Toujours mettre à jour, même si vide (pour gérer le cas "aucune conversation")
    setConversations(conversationsData);
    
    // Charger les noms de tous les participants
    const names = new Map<string, string>();
    for (const conv of conversationsData) {
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
    
    if (conversationsData.length > 0) {
      console.log(`✅ ${conversationsData.length} conversations chargées depuis React Query`);
    } else if (!isLoadingConversations) {
      console.log(`ℹ️ Aucune conversation trouvée`);
    }
  }, [conversationsData, isLoadingConversations]);

  // Fonction pour charger les détails d'une conversation (mission, profils, dernier message)
  const loadConversationDetails = useCallback(
    async (
      conversation: Conversation
    ): Promise<ConversationWithDetails | null> => {
      try {
        // Charger la mission
        const { data: mission } = await supabase
          .from("missions")
          .select("id, title")
          .eq("id", conversation.mission_id)
          .single();

        // Charger les profils
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, photo_url")
          .in("id", [conversation.recruiter_id, conversation.freelance_id]);

        const recruiter = profiles?.find(
          (p) => p.id === conversation.recruiter_id
        );
        const freelance = profiles?.find(
          (p) => p.id === conversation.freelance_id
        );

        // Charger le dernier message
        const { data: lastMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMessage =
          lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;

        return {
          ...conversation,
          mission: mission || null,
          recruiter: recruiter || null,
          freelance: freelance || null,
          last_message: lastMessage || null,
        };
      } catch (err) {
        console.error(
          "Erreur lors du chargement des détails de la conversation:",
          err
        );
        return null;
      }
    },
    []
  );

  // Plus besoin de loadConversations, React Query gère tout

  // Configurer l'abonnement Realtime pour les conversations
  useEffect(() => {
    if (!profile) return;

    console.log(
      "🔌 Configuration de l'abonnement Realtime pour les conversations"
    );

    // Nettoyer l'ancien abonnement si il existe
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    const userId = profile.id;
    const channelName = `conversations:user:${userId}:${Date.now()}`;

    // Créer un channel pour écouter les changements sur les conversations
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        async (payload) => {
          const newConversation = payload.new as Conversation;
          console.log("➕ Nouvelle conversation créée:", newConversation.id);

          // Vérifier si l'utilisateur est participant de cette conversation
          if (
            newConversation.recruiter_id === userId ||
            newConversation.freelance_id === userId
          ) {
            // Éviter les doublons
            setConversations((prev) => {
              if (prev.some((c) => c.id === newConversation.id)) {
                return prev;
              }

              // Charger les détails de la conversation et l'ajouter
              loadConversationDetails(newConversation).then((details) => {
                if (details) {
                  setConversations((current) => {
                    // Éviter les doublons
                    if (current.some((c) => c.id === newConversation.id)) {
                      return current;
                    }

                    // Trier par created_at desc
                    const updated = [details, ...current];
                    updated.sort((a, b) => {
                      const aDate = new Date(a.created_at || 0).getTime();
                      const bDate = new Date(b.created_at || 0).getTime();
                      return bDate - aDate;
                    });
                    return updated;
                  });

                  // Mettre à jour les noms des participants
                  if (details.recruiter) {
                    const recruiterName =
                      `${details.recruiter.first_name || ""} ${details.recruiter.last_name || ""}`.trim() ||
                      "Recruteur";
                    setSenderNames((prev) => {
                      const updated = new Map(prev);
                      updated.set(details.recruiter_id, recruiterName);
                      return updated;
                    });
                  }
                  if (details.freelance) {
                    const freelanceName =
                      `${details.freelance.first_name || ""} ${details.freelance.last_name || ""}`.trim() ||
                      "Freelance";
                    setSenderNames((prev) => {
                      const updated = new Map(prev);
                      updated.set(details.freelance_id, freelanceName);
                      return updated;
                    });
                  }
                }
              });

              return prev;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
        },
        async (payload) => {
          const updatedConversation = payload.new as Conversation;
          console.log("🔄 Conversation mise à jour:", updatedConversation.id);

          // Mettre à jour la conversation dans la liste
          setConversations((prev) => {
            const index = prev.findIndex(
              (c) => c.id === updatedConversation.id
            );
            if (index === -1) return prev;

            // Si l'utilisateur n'est plus participant, retirer la conversation
            if (
              updatedConversation.recruiter_id !== userId &&
              updatedConversation.freelance_id !== userId
            ) {
              return prev.filter((c) => c.id !== updatedConversation.id);
            }

            // Sinon, mettre à jour
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              ...updatedConversation,
            };
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const deletedConversation = payload.old as Conversation;
          console.log("🗑️ Conversation supprimée:", deletedConversation.id);

          // Retirer la conversation de la liste
          setConversations((prev) =>
            prev.filter((c) => c.id !== deletedConversation.id)
          );

          // Si c'était la conversation sélectionnée, désélectionner
          if (selectedConversationId === deletedConversation.id) {
            setSelectedConversationId(null);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as any;
          console.log("📨 Nouveau message créé:", newMessage.id);

          // Mettre à jour le dernier message des conversations concernées
          setConversations((prev) => {
            const conversation = prev.find(
              (c) => c.id === newMessage.conversation_id
            );
            if (!conversation) return prev;

            // Mettre à jour la conversation avec le nouveau dernier message
            const updated = prev.map((c) => {
              if (c.id === newMessage.conversation_id) {
                // Déplacer la conversation en haut de la liste
                return {
                  ...c,
                  last_message: newMessage,
                };
              }
              return c;
            });

            // Trier pour mettre la conversation mise à jour en premier
            updated.sort((a, b) => {
              const aLastMsgDate =
                a.last_message?.created_at || a.created_at || "0";
              const bLastMsgDate =
                b.last_message?.created_at || b.created_at || "0";
              const aDate = new Date(aLastMsgDate).getTime();
              const bDate = new Date(bLastMsgDate).getTime();
              return bDate - aDate;
            });

            return updated;
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Abonnement Realtime activé pour les conversations");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Erreur lors de l'abonnement Realtime:", err);
        } else if (status === "TIMED_OUT") {
          console.warn("⏱️ Timeout lors de l'abonnement Realtime");
        } else if (status === "CLOSED") {
          console.warn("🔌 Connexion Realtime fermée");
        }
      });

    subscriptionRef.current = channel;

    // Nettoyer l'abonnement au démontage
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [profile?.id, loadConversationDetails]);

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
    refreshConversations: async () => {
      await refreshConversations();
    },
  };
}
