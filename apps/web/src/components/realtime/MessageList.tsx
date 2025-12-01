"use client";

import { YStack, Text } from "tamagui";
import { StreamBuilder } from "./StreamBuilder";
import { colors } from "@shiftly/ui";
import type { Message } from "@shiftly/data";

interface MessageListProps {
  conversationId: string;
}

/**
 * Exemple d'utilisation de StreamBuilder pour afficher une liste de messages en temps réel
 */
export function MessageList({ conversationId }: MessageListProps) {
  return (
    <StreamBuilder<Message>
      table="messages"
      options={{
        filter: `conversation_id=eq.${conversationId}`,
        orderBy: { column: "created_at", ascending: true },
      }}
      loadingBuilder={() => (
        <YStack padding="$4" alignItems="center">
          <Text fontSize={14} color={colors.gray700}>
            Chargement des messages...
          </Text>
        </YStack>
      )}
      errorBuilder={(error) => (
        <YStack padding="$4" alignItems="center">
          <Text fontSize={14} color="#EF4444">
            Erreur: {error}
          </Text>
        </YStack>
      )}
      builder={(messages) => {
        if (messages.length === 0) {
          return (
            <YStack padding="$4" alignItems="center">
              <Text fontSize={14} color={colors.gray700} textAlign="center">
                Aucun message pour le moment.
              </Text>
            </YStack>
          );
        }

        return (
          <YStack gap="$2" padding="$4">
            {messages.map((message) => (
              <YStack
                key={message.id}
                padding="$3"
                backgroundColor={colors.white}
                borderRadius={8}
                borderWidth={1}
                borderColor={colors.gray200}
              >
                <Text fontSize={14} color={colors.gray900}>
                  {message.content}
                </Text>
                {message.created_at && (
                  <Text fontSize={11} color={colors.gray500} marginTop="$1">
                    {new Date(message.created_at).toLocaleString("fr-FR")}
                  </Text>
                )}
              </YStack>
            ))}
          </YStack>
        );
      }}
    />
  );
}

