import { Card, XStack, YStack, H4, Paragraph } from "tamagui";
import { Avatar } from "../Avatar";

interface ProfileCardProps {
  name: string;
  title: string;
  location: string;
  rating?: number;
  avatarUrl?: string;
  onPress?: () => void;
}

export function ProfileCard({
  name,
  title,
  location,
  rating,
  avatarUrl,
  onPress,
}: ProfileCardProps) {
  return (
    <Card
      padding="$4"
      marginBottom="$3"
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
    >
      <XStack gap="$3" alignItems="center">
        <Avatar source={{ uri: avatarUrl }} size="$4" />

        <YStack flex={1} gap="$1">
          <H4 size="$5" fontWeight="600">
            {name}
          </H4>

          <Paragraph size="$3" color="$gray10">
            {title}
          </Paragraph>

          <XStack alignItems="center" gap="$2">
            <span style={{ fontSize: "14px" }}>📍</span>
            <Paragraph size="$3" color="$gray10">
              {location}
            </Paragraph>
          </XStack>

          {rating && (
            <XStack alignItems="center" gap="$1">
              <span style={{ fontSize: "14px" }}>⭐</span>
              <Paragraph size="$3" color="$gray10">
                {rating}/5
              </Paragraph>
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
