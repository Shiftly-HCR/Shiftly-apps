import { Card, XStack, YStack, H4, Paragraph, Button } from "tamagui";

interface MissionCardProps {
  title: string;
  location: string;
  time: string;
  price: string;
  image?: string;
  onPress?: () => void;
  onApply?: () => void;
}

export function MissionCard({
  title,
  location,
  time,
  price,
  image,
  onPress,
  onApply,
}: MissionCardProps) {
  return (
    <Card
      padding="$4"
      marginBottom="$3"
      pressStyle={{ scale: 0.98 }}
      onPress={onPress}
    >
      <YStack gap="$3">
        {image && (
          <div
            style={{
              height: "120px",
              width: "100%",
              borderRadius: "8px",
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <YStack gap="$2">
          <H4 size="$5" fontWeight="600">
            {title}
          </H4>

          <XStack alignItems="center" gap="$2">
            <span style={{ fontSize: "14px" }}>📍</span>
            <Paragraph size="$3" color="$gray10">
              {location}
            </Paragraph>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <span style={{ fontSize: "14px" }}>🕐</span>
            <Paragraph size="$3" color="$gray10">
              {time}
            </Paragraph>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <span style={{ fontSize: "14px" }}>💰</span>
            <Paragraph size="$4" fontWeight="600" color="$violet10">
              {price}
            </Paragraph>
          </XStack>
        </YStack>

        {onApply && (
          <Button
            backgroundColor="$violet9"
            color="white"
            size="$4"
            onPress={onApply}
            marginTop="$2"
          >
            Postuler
          </Button>
        )}
      </YStack>
    </Card>
  );
}
