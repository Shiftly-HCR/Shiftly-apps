import { YStack, Paragraph, XStack } from "tamagui";

interface ChatBubbleProps {
  message: string;
  isMe: boolean;
  timestamp?: string;
  senderName?: string;
}

export function ChatBubble({
  message,
  isMe,
  timestamp,
  senderName,
}: ChatBubbleProps) {
  return (
    <XStack jc={isMe ? "flex-end" : "flex-start"} marginBottom="$3">
      <YStack
        maxWidth="80%"
        bg={isMe ? "$violet9" : "$gray3"}
        padding="$3"
        borderRadius="$4"
        brtl={isMe ? "$1" : "$4"}
        brtr={isMe ? "$4" : "$1"}
        brbl={isMe ? "$4" : "$1"}
        brbr={isMe ? "$1" : "$4"}
      >
        {!isMe && senderName && (
          <Paragraph size="$2" fontWeight="600" marginBottom="$1" color="$gray11">
            {senderName}
          </Paragraph>
        )}

        <Paragraph size="$4" color={isMe ? "white" : "$gray12"}>
          {message}
        </Paragraph>

        {timestamp && (
          <Paragraph size="$2" color={isMe ? "$gray8" : "$gray10"} marginTop="$1">
            {timestamp}
          </Paragraph>
        )}
      </YStack>
    </XStack>
  );
}
