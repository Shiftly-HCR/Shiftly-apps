"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import type { Message, MessageWithSender } from "../types/message";
import {
  getMessagesByConversation,
  sendMessage,
  markConversationAsRead,
} from "./messages";

/**
 * Hook pour gérer une conversation en temps réel avec Supabase Realtime
 */
export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Charger les messages initiaux
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const loadedMessages = await getMessagesByConversation(conversationId);
        setMessages(loadedMessages);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Marquer la conversation comme lue au chargement
    markConversationAsRead(conversationId).catch((err) => {
      console.error(
        "Erreur lors du marquage de la conversation comme lue:",
        err
      );
    });
  }, [conversationId]);

  // Configurer l'abonnement Realtime
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Nettoyer l'ancien abonnement si la conversation change
    if (
      conversationIdRef.current !== conversationId &&
      subscriptionRef.current
    ) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    conversationIdRef.current = conversationId;

    // Créer un nouveau channel pour cette conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => {
            // Éviter les doublons
            if (prevMessages.some((msg) => msg.id === newMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, newMessage];
          });

          // Marquer automatiquement comme lu si on est le destinataire
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && newMessage.sender_id !== user.id) {
              markConversationAsRead(conversationId).catch((err) => {
                console.error(
                  "Erreur lors du marquage automatique comme lu:",
                  err
                );
              });
            }
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Abonnement Realtime activé pour la conversation ${conversationId}`
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error("Erreur lors de l'abonnement Realtime");
          setError("Erreur de connexion en temps réel");
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
  }, [conversationId]);

  // Fonction pour envoyer un message
  const handleSendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!conversationId || !content.trim()) {
        return false;
      }

      setIsSending(true);
      setError(null);

      try {
        const result = await sendMessage({
          conversationId,
          content,
        });

        if (!result.success) {
          setError(result.error || "Erreur lors de l'envoi du message");
          return false;
        }

        return true;
      } catch (err: any) {
        setError(
          err.message || "Une erreur est survenue lors de l'envoi du message"
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId]
  );

  // Fonction pour marquer la conversation comme lue
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await markConversationAsRead(conversationId);
    } catch (err: any) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  }, [conversationId]);

  return {
    messages,
    isLoading,
    error,
    isSending,
    sendMessage: handleSendMessage,
    markAsRead,
  };
}
