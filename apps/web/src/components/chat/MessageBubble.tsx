"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { Message } from "@shiftly/data";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  senderName?: string;
}

export function MessageBubble({
  message,
  isMe,
  senderName,
}: MessageBubbleProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Moins d'une minute : "à l'instant"
    if (diffInSeconds < 60) {
      return "à l'instant";
    }

    // Moins d'une heure : "il y a X minutes"
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `il y a ${minutes} min`;
    }

    // Aujourd'hui : "HH:mm"
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Hier : "Hier à HH:mm"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Plus ancien : "DD/MM à HH:mm"
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <XStack
      justifyContent={isMe ? "flex-end" : "flex-start"}
      marginBottom="$3"
      width="100%"
    >
      <YStack
        maxWidth="75%"
        backgroundColor={isMe ? colors.shiftlyViolet : colors.gray200}
        padding="$3"
        borderRadius={12}
        borderTopLeftRadius={isMe ? 12 : 4}
        borderTopRightRadius={isMe ? 4 : 12}
      >
        <Text
          fontSize={14}
          color={isMe ? colors.white : colors.gray900}
          lineHeight={20}
        >
          {message.content}
        </Text>

        {message.created_at && (
          <Text
            fontSize={11}
            color={isMe ? "rgba(255, 255, 255, 0.7)" : colors.gray500}
            marginTop="$1"
          >
            {formatTime(message.created_at)}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
