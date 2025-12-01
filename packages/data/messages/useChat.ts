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
      console.log(
        `🔄 Nettoyage de l'abonnement précédent pour la conversation ${conversationIdRef.current}`
      );
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    conversationIdRef.current = conversationId;

    console.log(
      `🔌 Configuration de l'abonnement Realtime pour la conversation ${conversationId}`
    );

    // Créer un nouveau channel pour cette conversation
    // Utiliser un nom unique avec timestamp pour éviter les conflits
    const channelName = `messages:${conversationId}:${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*", // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("📨 Événement Realtime reçu:", {
            eventType: payload.eventType,
            table: payload.table,
            new: payload.new,
            old: payload.old,
          });

          // Traiter les INSERT
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as Message;
          
            setMessages((prevMessages) => {
              // Éviter les doublons
              if (prevMessages.some((msg) => msg.id === newMessage.id)) {
                console.log("⚠️ Message déjà présent, ignoré:", newMessage.id);
                return prevMessages;
              }
              
              console.log("✅ Ajout du nouveau message:", newMessage.id);
              
              // Remplacer un message temporaire si il existe (même contenu et même sender)
              const tempIndex = prevMessages.findIndex(
                (msg) =>
                  msg.id.startsWith("temp-") &&
                  msg.sender_id === newMessage.sender_id &&
                  msg.content === newMessage.content
              );
              
              if (tempIndex !== -1) {
                // Remplacer le message temporaire par le message réel
                console.log("🔄 Remplacement du message temporaire:", tempIndex);
                const updated = [...prevMessages];
                updated[tempIndex] = newMessage;
                // Trier par created_at pour maintenir l'ordre chronologique
                updated.sort((a, b) => {
                  const aDate = new Date(a.created_at || 0).getTime();
                  const bDate = new Date(b.created_at || 0).getTime();
                  return aDate - bDate;
                });
                return updated;
              }
              
              // Ajouter le nouveau message et trier
              const updated = [...prevMessages, newMessage];
              updated.sort((a, b) => {
                const aDate = new Date(a.created_at || 0).getTime();
                const bDate = new Date(b.created_at || 0).getTime();
                return aDate - bDate;
              });
              return updated;
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
          
          // Traiter les UPDATE
          if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as Message;
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
          
          // Traiter les DELETE
          if (payload.eventType === "DELETE") {
            const deletedMessage = payload.old as Message;
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== deletedMessage.id)
            );
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `✅ Abonnement Realtime activé pour la conversation ${conversationId}`
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(
            "❌ Erreur lors de l'abonnement Realtime:",
            err || "Erreur inconnue"
          );
          setError("Erreur de connexion en temps réel");
        } else if (status === "TIMED_OUT") {
          console.warn(
            "⏱️ Timeout lors de l'abonnement Realtime pour la conversation",
            conversationId
          );
          setError("Timeout de connexion en temps réel");
        } else if (status === "CLOSED") {
          console.warn(
            "🔌 Connexion Realtime fermée pour la conversation",
            conversationId
          );
        } else {
          console.log(`📡 Statut Realtime: ${status} pour la conversation ${conversationId}`);
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

      // Récupérer l'utilisateur actuel pour créer un message optimiste
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Utilisateur non connecté");
        setIsSending(false);
        return false;
      }

      // Créer un message temporaire avec un ID unique pour l'ajout optimiste
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        read_at: null,
      };

      // Ajouter le message optimistiquement
      setMessages((prevMessages) => {
        // Vérifier qu'il n'existe pas déjà
        if (prevMessages.some((msg) => msg.id === tempId)) {
          return prevMessages;
        }
        return [...prevMessages, optimisticMessage];
      });

      try {
        const result = await sendMessage({
          conversationId,
          content,
        });

        if (!result.success || !result.message) {
          // En cas d'erreur, retirer le message optimiste
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== tempId)
          );
          setError(result.error || "Erreur lors de l'envoi du message");
          setIsSending(false);
          return false;
        }

        // Remplacer le message temporaire par le message réel du serveur
        setMessages((prevMessages) => {
          const withoutTemp = prevMessages.filter((msg) => msg.id !== tempId);
          // Vérifier que le message réel n'existe pas déjà (au cas où Realtime l'aurait déjà ajouté)
          if (withoutTemp.some((msg) => msg.id === result.message!.id)) {
            console.log("📨 Message déjà ajouté via Realtime, ignoré");
            return withoutTemp;
          }
          console.log("✅ Ajout du message confirmé du serveur:", result.message!.id);
          const updated = [...withoutTemp, result.message!];
          // Trier par created_at pour maintenir l'ordre chronologique
          updated.sort((a, b) => {
            const aDate = new Date(a.created_at || 0).getTime();
            const bDate = new Date(b.created_at || 0).getTime();
            return aDate - bDate;
          });
          return updated;
        });

        return true;
      } catch (err: any) {
        // En cas d'erreur, retirer le message optimiste
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== tempId)
        );
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
