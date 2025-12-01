"use client";

import { YStack, ScrollView, Text } from "tamagui";
import { useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@shiftly/data";
import { useAutoScroll } from "@/hooks";

interface ChatThreadProps {
  messages: Message[];
  currentUserId: string;
  senderNames?: Map<string, string>;
  isLoading?: boolean;
}

export function ChatThread({
  messages,
  currentUserId,
  senderNames,
  isLoading = false,
}: ChatThreadProps) {
  const scrollViewRef = useRef<any>(null);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useAutoScroll({
    scrollViewRef,
    dependency: messages,
    enabled: messages.length > 0,
  });

  if (isLoading && messages.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <Text fontSize={14} color="#666">
          Chargement des messages...
        </Text>
      </YStack>
    );
  }

  if (messages.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
        <Text fontSize={14} color="#666" textAlign="center">
          Aucun message pour le moment.
          <br />
          Soyez le premier à envoyer un message !
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      flex={1}
      padding="$4"
      backgroundColor="#F9FAFB"
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }}
    >
      <YStack gap="$2">
        {messages.map((message) => {
          const isMe = message.sender_id === currentUserId;
          const senderName = senderNames?.get(message.sender_id);

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isMe={isMe}
              senderName={senderName}
            />
          );
        })}
      </YStack>
    </ScrollView>
  );
}
