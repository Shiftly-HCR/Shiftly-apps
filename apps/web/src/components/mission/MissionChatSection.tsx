"use client";

import { YStack, XStack, Text, Button } from "tamagui";
import { MessageCircle } from "lucide-react";
import { ChatThread, MessageInput } from "@/components";

interface ChatData {
  canAccess: boolean;
  isLoading: boolean;
  error?: string | null;
  messages: any[];
  currentUserId?: string | null;
  senderNames: Map<string, string>;
  sendMessage: (content: string) => Promise<boolean>;
  markAsRead: () => void;
  isSending: boolean;
}

interface MissionChatSectionProps {
  title: string;
  chat: ChatData;
  selectedFreelanceId?: string | null;
  onSelectFreelance?: (freelanceId: string) => void;
  freelances?: Array<{
    id: string;
    name: string;
  }>;
}

export function MissionChatSection({
  title,
  chat,
  selectedFreelanceId,
  onSelectFreelance,
  freelances = [],
}: MissionChatSectionProps) {
  return (
    <YStack
      backgroundColor="white"
      borderRadius={12}
      padding="$5"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={8}
      gap="$4"
    >
      <Text fontSize={18} fontWeight="bold" color="#000">
        {title}
      </Text>

      {/* Liste des freelances acceptés pour chatter */}
      {freelances.length > 0 && (
        <YStack gap="$3">
          {freelances.map((freelance) => {
            const isSelected = selectedFreelanceId === freelance.id;

            return (
              <Button
                key={freelance.id}
                variant={isSelected ? "primary" : "outline"}
                size="sm"
                width="100%"
                onPress={() => onSelectFreelance?.(freelance.id)}
              >
                <XStack alignItems="center" width="100%" paddingHorizontal="$2">
                  <MessageCircle 
                    size={16} 
                    style={{ flexShrink: 0 }} 
                    color={isSelected ? "white" : undefined}
                  />
                  <Text color={isSelected ? "white" : undefined}>{freelance.name}</Text>
                </XStack>
              </Button>
            );
          })}
        </YStack>
      )}

      {freelances.length === 0 && (
        <Text fontSize={14} color="#666">
          Aucun freelance accepté pour le moment
        </Text>
      )}

      {/* Chat avec le freelance sélectionné */}
      {selectedFreelanceId && chat.canAccess && (
        <YStack
          borderWidth={1}
          borderColor="#E5E7EB"
          borderRadius={8}
          height={500}
          overflow="hidden"
          marginTop="$3"
        >
          <YStack
            backgroundColor="#F9FAFB"
            padding="$3"
            borderBottomWidth={1}
            borderBottomColor="#E5E7EB"
          >
            <Text fontSize={14} fontWeight="600" color="#000">
              Conversation avec{" "}
              {chat.senderNames.get(selectedFreelanceId) || "Freelance"}
            </Text>
          </YStack>

          <ChatThread
            messages={chat.messages}
            currentUserId={chat.currentUserId || ""}
            senderNames={chat.senderNames}
            isLoading={chat.isLoading}
          />

          <MessageInput
            onSend={async (content) => {
              const success = await chat.sendMessage(content);
              if (success) {
                chat.markAsRead();
              }
            }}
            isSending={chat.isSending}
          />
        </YStack>
      )}

      {chat.isLoading && (
        <YStack padding="$4" alignItems="center">
          <Text fontSize={14} color="#666">
            Initialisation de la conversation...
          </Text>
        </YStack>
      )}

      {chat.error && !chat.canAccess && (
        <YStack padding="$4" alignItems="center" gap="$2">
          <Text fontSize={14} color="#666">
            {chat.error ?? "Impossible d'accéder à la conversation"}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

