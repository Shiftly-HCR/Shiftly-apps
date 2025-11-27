import { Card, YStack, H3, Paragraph, XStack } from "tamagui";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "$violet10",
}: StatsCardProps) {
  return (
    <Card padding="$4" backgroundColor="$background" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
      <YStack gap="$2">
        <XStack alignItems="center" justifyContent="space-between">
          <Paragraph size="$3" color="$gray10">
            {title}
          </Paragraph>
          {icon}
        </XStack>

        <H3 size="$7" fontWeight="700" color={color}>
          {value}
        </H3>

        {subtitle && (
          <Paragraph size="$2" color="$gray10">
            {subtitle}
          </Paragraph>
        )}
      </YStack>
    </Card>
  );
}
