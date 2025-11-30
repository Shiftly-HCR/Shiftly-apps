"use client";

import { YStack, XStack, TextArea } from "tamagui";
import { Button } from "@shiftly/ui";
import { useState, KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isSending?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  isSending = false,
  placeholder = "Écrivez un message...",
}: MessageInputProps) {
  const [content, setContent] = useState("");

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) {
      return;
    }

    await onSend(trimmedContent);
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Envoyer avec Entrée (sans Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <YStack
      backgroundColor="white"
      borderTopWidth={1}
      borderTopColor="#E5E7EB"
      padding="$3"
      gap="$2"
    >
      <XStack gap="$2" alignItems="flex-end">
        <YStack flex={1}>
          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder={placeholder}
            minHeight={60}
            maxHeight={120}
            borderRadius={12}
            borderWidth={1}
            borderColor="#E5E7EB"
            padding="$3"
            fontSize={14}
            backgroundColor="#F9FAFB"
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
        </YStack>
        <Button
          variant="primary"
          size="md"
          onPress={handleSend}
          disabled={!content.trim() || isSending}
          minWidth={80}
        >
          {isSending ? "..." : "Envoyer"}
        </Button>
      </XStack>
    </YStack>
  );
}
