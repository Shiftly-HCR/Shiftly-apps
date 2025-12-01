"use client";

import { XStack, YStack, Text } from "tamagui";
import { colors } from "@shiftly/ui";
import type { Message } from "@shiftly/data";
import { useFormatTime } from "@/hooks";

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
  const { formatTime } = useFormatTime();

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
