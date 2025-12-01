"use client";

import { useState } from "react";

interface UseMessageInputProps {
  onSend: (content: string) => Promise<void>;
  isSending?: boolean;
}

/**
 * Hook pour gérer l'état et les interactions d'un input de message
 */
export function useMessageInput({
  onSend,
  isSending = false,
}: UseMessageInputProps) {
  const [content, setContent] = useState("");

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) {
      return;
    }

    await onSend(trimmedContent);
    setContent("");
  };

  return {
    content,
    setContent,
    handleSend,
  };
}
