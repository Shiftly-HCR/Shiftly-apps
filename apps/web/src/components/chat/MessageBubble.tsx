"use client";

import { ChatBubble } from "@shiftly/ui";
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
      return `Hier à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
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
    <ChatBubble
      message={message.content}
      isMe={isMe}
      timestamp={formatTime(message.created_at)}
      senderName={senderName}
    />
  );
}
